import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getSecretKey } from "./config";

const PREFIX = "cp1:";

function keyBytes(): Buffer {
  const secret = getSecretKey();
  if (!secret) {
    throw new Error(
      "CONTROL_PLANE_SECRET_KEY required (min 32 chars) to store kubeconfigs",
    );
  }
  return createHash("sha256").update(secret).digest();
}

/** Encrypt plaintext kubeconfig for at-rest storage. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return (
    PREFIX +
    Buffer.concat([iv, tag, enc]).toString("base64url")
  );
}

export function decryptSecret(payload: string): string {
  if (!payload.startsWith(PREFIX)) {
    // Legacy plaintext file — only allowed when real ops explicitly enabled in lab.
    return payload;
  }
  const raw = Buffer.from(payload.slice(PREFIX.length), "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function isEncryptedPayload(payload: string) {
  return payload.startsWith(PREFIX);
}
