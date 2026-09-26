"use client";

import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader } from "@/components/control-plane/ui";

export default function ModelsPage() {
  const { world } = useControlPlane();
  return (
    <div>
      <PageHeader
        title="Model Registry"
        subtitle="Immutable versions · ONNX Runtime abstraction · TensorRT/Triton/NIM adapters later"
        actions={<ModePill mode="SIMULATION" />}
      />
      <div className="cp-panel overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-[12px]">
          <thead className="text-[10px] uppercase text-[var(--cp-muted)]">
            <tr className="border-b border-[var(--cp-border)]">
              {["Name", "Version", "Runtime", "Arch", "Size", "SHA256", "GPU", "Status"].map(
                (h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {world.models.map((m) => (
              <tr key={m.id} className="border-t border-[var(--cp-border)]">
                <td className="px-3 py-2 font-medium">{m.name}</td>
                <td className="cp-mono px-3 py-2">{m.version}</td>
                <td className="px-3 py-2 text-[var(--cp-muted)]">{m.runtime}</td>
                <td className="px-3 py-2">{m.architecture}</td>
                <td className="cp-mono px-3 py-2">{m.sizeMb} MB</td>
                <td className="cp-mono px-3 py-2 text-[10px] text-[var(--cp-muted)]">
                  {m.sha256.slice(0, 16)}…
                </td>
                <td className="px-3 py-2">{m.gpuCompatible ? "yes" : "no"}</td>
                <td className="px-3 py-2">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
