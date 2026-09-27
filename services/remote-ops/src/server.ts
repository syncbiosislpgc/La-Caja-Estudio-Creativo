import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { timingSafeEqual } from "crypto";
import { getConfig } from "./config.js";
import { LabKubernetes } from "./k8s.js";
import { validateDeploy } from "./policy.js";

const cfg = getConfig();
const lab = new LabKubernetes(cfg);

type Audit = {
  at: string;
  action: string;
  ok: boolean;
  detail?: Record<string, unknown>;
};
const auditRing: Audit[] = [];

function logAudit(action: string, ok: boolean, detail?: Record<string, unknown>) {
  const evt = { at: new Date().toISOString(), action, ok, detail };
  auditRing.unshift(evt);
  if (auditRing.length > 200) auditRing.pop();
  console.info(
    JSON.stringify({
      level: "info",
      service: "remote-ops",
      ...evt,
      // never log tokens
    }),
  );
}

function authorized(req: IncomingMessage): boolean {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || token.length !== cfg.token.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(cfg.token));
  } catch {
    return false;
  }
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(Buffer.from(c));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function send(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const path = url.pathname;
  const method = req.method ?? "GET";

  if (path === "/healthz") {
    try {
      const h = await lab.health();
      return send(res, 200, { ...h, bind: cfg.bind, telemetrySource: "kubernetes-api" });
    } catch (e) {
      return send(res, 503, {
        ok: false,
        error: e instanceof Error ? e.message : "unhealthy",
      });
    }
  }

  if (!authorized(req)) {
    logAudit(`${method} ${path}`, false, { reason: "unauthorized" });
    return send(res, 401, { error: "Unauthorized" });
  }

  try {
    if (method === "GET" && path === "/v1/cluster") {
      const h = await lab.health();
      const nodes = await lab.listNodes();
      return send(res, 200, {
        cluster: {
          id: cfg.clusterId,
          name: cfg.clusterName,
          region: cfg.region,
          version: h.version,
          status: "CONNECTED",
          source: "kubernetes",
          provider: "k3s",
          nodeCount: nodes.length,
          namespace: cfg.namespace,
        },
        telemetry: {
          source: "Kubernetes API",
          advancedMetrics: "Not configured",
          updatedAt: new Date().toISOString(),
        },
      });
    }

    if (method === "GET" && path === "/v1/nodes") {
      return send(res, 200, { nodes: await lab.listNodes() });
    }

    if (method === "GET" && path === "/v1/workloads") {
      return send(res, 200, { workloads: await lab.listWorkloads() });
    }

    if (method === "GET" && path === "/v1/events") {
      return send(res, 200, { events: await lab.events() });
    }

    if (method === "GET" && path === "/v1/audit") {
      return send(res, 200, { audit: auditRing.slice(0, 50) });
    }

    if (method === "POST" && path === "/v1/workloads") {
      const body = (await readJson(req)) as {
        name?: string;
        image?: string;
        namespace?: string;
        replicas?: number;
        cpu?: string;
        memory?: string;
        preferredNodeName?: string;
        idempotencyKey?: string;
      };
      const policy = validateDeploy(cfg, body);
      if (!policy.ok) {
        logAudit("workload.deploy", false, { reason: policy.reason });
        return send(res, 400, { error: policy.reason });
      }
      const result = await lab.deploy({
        name: body.name!,
        image: body.image!,
        replicas: body.replicas,
        cpu: body.cpu,
        memory: body.memory,
        preferredNodeName: body.preferredNodeName,
      });
      logAudit("workload.deploy", true, {
        name: body.name,
        image: body.image,
        idempotencyKey: body.idempotencyKey,
      });
      return send(res, 200, { result });
    }

    const wlMatch = path.match(/^\/v1\/workloads\/([^/]+)$/);
    if (wlMatch) {
      const name = decodeURIComponent(wlMatch[1]);
      if (method === "DELETE") {
        await lab.delete(name);
        logAudit("workload.delete", true, { name });
        return send(res, 200, { ok: true });
      }
      if (method === "POST") {
        const body = (await readJson(req)) as {
          action?: "restart" | "stop" | "scale";
          replicas?: number;
        };
        if (body.action === "restart") {
          await lab.restart(name);
          logAudit("workload.restart", true, { name });
          return send(res, 200, { ok: true });
        }
        if (body.action === "stop") {
          await lab.scale(name, 0);
          logAudit("workload.stop", true, { name });
          return send(res, 200, { ok: true });
        }
        if (body.action === "scale") {
          if (
            typeof body.replicas !== "number" ||
            body.replicas < 0 ||
            body.replicas > cfg.maxReplicas
          ) {
            return send(res, 400, { error: "invalid replicas" });
          }
          await lab.scale(name, body.replicas);
          logAudit("workload.scale", true, { name, replicas: body.replicas });
          return send(res, 200, { ok: true });
        }
        return send(res, 400, { error: "action must be restart|stop|scale" });
      }
    }

    if (method === "POST" && path === "/v1/lab/reset") {
      const wls = await lab.listWorkloads();
      for (const w of wls) {
        if (w.name === "seed-nginx") continue;
        await lab.delete(w.name);
      }
      logAudit("lab.reset", true, { deleted: wls.length });
      return send(res, 200, { ok: true, deleted: wls.map((w) => w.name) });
    }

    return send(res, 404, { error: "not found" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    logAudit(`${method} ${path}`, false, { error: message });
    return send(res, 500, { error: message });
  }
}

const server = createServer((req, res) => {
  void handler(req, res);
});

server.listen(cfg.port, cfg.bind, () => {
  console.info(
    JSON.stringify({
      level: "info",
      service: "remote-ops",
      msg: "listening",
      bind: cfg.bind,
      port: cfg.port,
      namespace: cfg.namespace,
      note: "Bind to 127.0.0.1 and expose only via Cloudflare Tunnel / outbound agent",
    }),
  );
});
