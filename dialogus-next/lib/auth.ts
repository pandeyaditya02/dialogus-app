const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET && process.env.NODE_ENV === "production") {
  console.warn("WARNING: SESSION_SECRET is not set in production!");
}

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const SESSION_DURATION_S = 24 * 60 * 60; // 24 hours
export const SESSION_DURATION_MS = SESSION_DURATION_S * 1000;

interface SessionPayload {
  userId: string;
  userName: string;
  expiry: number;
}

async function getSigningKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET || "fallback-secret-change-me");
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const key = await getSigningKey();
  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr);

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );

  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifySession(cookie: string): Promise<SessionPayload | null> {
  try {
    if (!SESSION_SECRET) return null;
    const [payloadB64, signatureB64] = cookie.split(".");
    if (!payloadB64 || !signatureB64) return null;

    const key = await getSigningKey();
    const encoder = new TextEncoder();
    const signature = fromBase64Url(signatureB64);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature as any,
      encoder.encode(payloadB64)
    );

    if (!valid) return null;

    const payload: SessionPayload = JSON.parse(atob(payloadB64));

    if (Date.now() > payload.expiry) return null;

    return payload;
  } catch {
    return null;
  }
}

interface SanityUser {
  id: string;
  name: string;
  email: string;
}

export async function verifySanityToken(token: string): Promise<SanityUser | null> {
  try {
    const userRes = await fetch("https://api.sanity.io/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) return null;

    const user = await userRes.json();
    if (!user?.id) return null;

    const projectRes = await fetch(
      `https://api.sanity.io/v1/projects/${SANITY_PROJECT_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!projectRes.ok) return null;

    const project = await projectRes.json();
    const isMember = project.members?.some(
      (m: { id: string }) => m.id === user.id
    );

    if (!isMember) return null;

    return { id: user.id, name: user.name || user.email, email: user.email };
  } catch {
    return null;
  }
}

export function createSessionPayload(user: SanityUser): SessionPayload {
  return {
    userId: user.id,
    userName: user.name,
    expiry: Date.now() + SESSION_DURATION_MS,
  };
}

export const SESSION_COOKIE_NAME = "dialogus_admin_session";
