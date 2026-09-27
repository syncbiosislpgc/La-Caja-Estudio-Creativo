type Level = "info" | "error" | "warn";

/** Structured logs — never log secrets / kubeconfig / tokens */
export function cpLog(
  level: Level,
  fields: Record<string, string | number | boolean | undefined>,
) {
  const line = {
    ts: new Date().toISOString(),
    level,
    component: "control-plane",
    ...fields,
  };
  const msg = JSON.stringify(line);
  if (level === "error") console.error(msg);
  else if (level === "warn") console.warn(msg);
  else console.info(msg);
}
