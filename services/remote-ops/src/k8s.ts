import * as k8s from "@kubernetes/client-node";
import type { RemoteOpsConfig } from "./config.js";

export type RemoteNode = {
  name: string;
  ready: boolean;
  arch?: string;
  osImage?: string;
  kubeletVersion?: string;
  cpuCapacity?: string;
  memoryCapacity?: string;
  cpuAllocatable?: string;
  memoryAllocatable?: string;
  labels: Record<string, string>;
  taints: string[];
  podCount: number;
};

export type RemoteWorkload = {
  id: string;
  name: string;
  namespace: string;
  image: string;
  replicas: number;
  readyReplicas: number;
  status: string;
  nodeName?: string;
  podName?: string;
  restarts: number;
};

export class LabKubernetes {
  private kc = new k8s.KubeConfig();
  private core: k8s.CoreV1Api;
  private apps: k8s.AppsV1Api;
  private versionApi: k8s.VersionApi;

  constructor(private cfg: RemoteOpsConfig) {
    this.kc.loadFromFile(cfg.kubeconfigPath);
    this.core = this.kc.makeApiClient(k8s.CoreV1Api);
    this.apps = this.kc.makeApiClient(k8s.AppsV1Api);
    this.versionApi = this.kc.makeApiClient(k8s.VersionApi);
  }

  async health() {
    const v = await this.versionApi.getCode();
    return {
      ok: true,
      version: v.gitVersion ?? "unknown",
      clusterId: this.cfg.clusterId,
      clusterName: this.cfg.clusterName,
      namespace: this.cfg.namespace,
    };
  }

  async listNodes(): Promise<RemoteNode[]> {
    const nodes = await this.core.listNode();
    const pods = await this.core.listPodForAllNamespaces();
    const counts = new Map<string, number>();
    for (const p of pods.items) {
      const n = p.spec?.nodeName;
      if (!n) continue;
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
    return nodes.items.map((n) => {
      const name = n.metadata?.name ?? "unknown";
      const ready = Boolean(
        n.status?.conditions?.some((c) => c.type === "Ready" && c.status === "True"),
      );
      return {
        name,
        ready,
        arch: n.status?.nodeInfo?.architecture,
        osImage: n.status?.nodeInfo?.osImage,
        kubeletVersion: n.status?.nodeInfo?.kubeletVersion,
        cpuCapacity: n.status?.capacity?.cpu,
        memoryCapacity: n.status?.capacity?.memory,
        cpuAllocatable: n.status?.allocatable?.cpu,
        memoryAllocatable: n.status?.allocatable?.memory,
        labels: n.metadata?.labels ?? {},
        taints: (n.spec?.taints ?? []).map(
          (t) => `${t.key}=${t.value ?? ""}:${t.effect}`,
        ),
        podCount: counts.get(name) ?? 0,
      };
    });
  }

  async listWorkloads(): Promise<RemoteWorkload[]> {
    const deps = await this.apps.listNamespacedDeployment({
      namespace: this.cfg.namespace,
    });
    const pods = await this.core.listNamespacedPod({
      namespace: this.cfg.namespace,
    });
    return deps.items.map((d) => mapDep(this.cfg.clusterId, d, pods.items));
  }

  async ensureNamespace() {
    try {
      await this.core.readNamespace({ name: this.cfg.namespace });
    } catch {
      await this.core.createNamespace({
        body: {
          metadata: {
            name: this.cfg.namespace,
            labels: { "control-plane.lacaja/managed": "true" },
          },
        },
      });
    }
  }

  async deploy(input: {
    name: string;
    image: string;
    replicas?: number;
    cpu?: string;
    memory?: string;
    preferredNodeName?: string;
  }) {
    await this.ensureNamespace();
    const ns = this.cfg.namespace;
    const affinity = input.preferredNodeName
      ? {
          nodeAffinity: {
            preferredDuringSchedulingIgnoredDuringExecution: [
              {
                weight: 100,
                preference: {
                  matchExpressions: [
                    {
                      key: "kubernetes.io/hostname",
                      operator: "In",
                      values: [input.preferredNodeName],
                    },
                  ],
                },
              },
            ],
          },
        }
      : undefined;

    const body: k8s.V1Deployment = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: input.name,
        namespace: ns,
        labels: {
          app: input.name,
          "control-plane.lacaja/managed": "true",
        },
      },
      spec: {
        replicas: input.replicas ?? 1,
        selector: { matchLabels: { app: input.name } },
        template: {
          metadata: {
            labels: {
              app: input.name,
              "control-plane.lacaja/managed": "true",
            },
          },
          spec: {
            affinity,
            containers: [
              {
                name: input.name,
                image: input.image,
                imagePullPolicy: "IfNotPresent",
                securityContext: { allowPrivilegeEscalation: false },
                resources: {
                  requests: {
                    cpu: input.cpu ?? "50m",
                    memory: input.memory ?? "64Mi",
                  },
                  limits: {
                    cpu: input.cpu ?? "200m",
                    memory: input.memory ?? "128Mi",
                  },
                },
              },
            ],
          },
        },
      },
    };

    try {
      await this.apps.createNamespacedDeployment({ namespace: ns, body });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("AlreadyExists") || msg.includes("409")) {
        await this.apps.replaceNamespacedDeployment({
          name: input.name,
          namespace: ns,
          body,
        });
      } else {
        throw e;
      }
    }
    return {
      workloadId: `${this.cfg.clusterId}:${ns}:${input.name}`,
      namespace: ns,
      name: input.name,
      status: "Deploying",
    };
  }

  async scale(name: string, replicas: number) {
    const dep = await this.apps.readNamespacedDeployment({
      name,
      namespace: this.cfg.namespace,
    });
    if (dep.spec) dep.spec.replicas = replicas;
    await this.apps.replaceNamespacedDeployment({
      name,
      namespace: this.cfg.namespace,
      body: dep,
    });
  }

  async restart(name: string) {
    const dep = await this.apps.readNamespacedDeployment({
      name,
      namespace: this.cfg.namespace,
    });
    const annotations = dep.spec?.template?.metadata?.annotations ?? {};
    annotations["control-plane.lacaja/restartedAt"] = new Date().toISOString();
    if (!dep.spec?.template?.metadata) {
      dep.spec!.template!.metadata = { annotations };
    } else {
      dep.spec.template.metadata.annotations = annotations;
    }
    await this.apps.replaceNamespacedDeployment({
      name,
      namespace: this.cfg.namespace,
      body: dep,
    });
  }

  async delete(name: string) {
    await this.apps.deleteNamespacedDeployment({
      name,
      namespace: this.cfg.namespace,
    });
  }

  async events() {
    const ev = await this.core.listNamespacedEvent({
      namespace: this.cfg.namespace,
    });
    return ev.items
      .slice(-40)
      .reverse()
      .map((e) => ({
        id: e.metadata?.uid ?? `evt-${Math.random()}`,
        type: e.reason ?? "Event",
        message: `${e.involvedObject?.kind}/${e.involvedObject?.name}: ${e.message ?? ""}`,
        severity: e.type === "Warning" ? "warning" : "info",
        at: String(
          e.lastTimestamp ??
            e.eventTime ??
            e.metadata?.creationTimestamp ??
            new Date().toISOString(),
        ),
      }));
  }
}

function mapDep(
  clusterId: string,
  d: k8s.V1Deployment,
  pods: k8s.V1Pod[],
): RemoteWorkload {
  const name = d.metadata?.name ?? "unknown";
  const ns = d.metadata?.namespace ?? "default";
  const desired = d.spec?.replicas ?? 0;
  const ready = d.status?.readyReplicas ?? 0;
  const related = pods.filter((p) => p.metadata?.labels?.app === name);
  const pod = related[0];
  let status = "Pending";
  if (desired === 0) status = "Stopped";
  else if (ready >= desired && desired > 0) status = "Running";
  else if ((d.status?.unavailableReplicas ?? 0) > 0) status = "Degraded";
  else status = "Deploying";
  return {
    id: `${clusterId}:${ns}:${name}`,
    name,
    namespace: ns,
    image: d.spec?.template?.spec?.containers?.[0]?.image ?? "unknown",
    replicas: desired,
    readyReplicas: ready,
    status,
    nodeName: pod?.spec?.nodeName,
    podName: pod?.metadata?.name,
    restarts:
      pod?.status?.containerStatuses?.reduce(
        (a, c) => a + (c.restartCount ?? 0),
        0,
      ) ?? 0,
  };
}
