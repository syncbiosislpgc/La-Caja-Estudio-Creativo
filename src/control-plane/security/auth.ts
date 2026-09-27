import { createHmac, timingSafeEqual } from "crypto";
import { getDemoCredentials, getSessionSecret, type CpRole } from "./config";

export type SessionUser = {
  username: string;
  role: CpRole;
  exp: number;
};

const COOKIE = "cp_session";
const TTL_MS = 1000 * 60 * 60 * 12; // 12h

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user: Omit<SessionUser, "exp">): string {
  const body: SessionUser = { ...user, exp: Date.now() + TTL_MS };
  const json = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${json}.${sign(json)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const [json, sig] = token.split(".");
  if (!json || !sig) return null;
  const expected = sign(json);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const user = JSON.parse(Buffer.from(json, "base64url").toString("utf8")) as SessionUser;
    if (!user.exp || user.exp < Date.now()) return null;
    if (!user.username || !user.role) return null;
    return user;
  } catch {
    return null;
  }
}

export function authenticateLocal(
  username: string,
  password: string,
): SessionUser | null {
  const { users } = getDemoCredentials();
  const found = users.find((u) => u.username === username);
  if (!found) return null;
  const a = Buffer.from(found.password);
  const b = Buffer.from(password);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { username: found.username, role: found.role, exp: Date.now() + TTL_MS };
}

export function sessionCookieName() {
  return COOKIE;
}

export function buildSessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TTL_MS / 1000}${secure}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSessionFromRequest(req: Request): SessionUser | null {
  const header = req.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  const bearer = req.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return verifySessionToken(bearer.slice(7));
  }
  return verifySessionToken(match?.[1]);
}
