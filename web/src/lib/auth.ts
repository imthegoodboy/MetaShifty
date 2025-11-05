import crypto from "crypto";

const SECRET = (process.env.WEB_SECRET || process.env.NEXTAUTH_SECRET) as string;
if (!SECRET) {
  throw new Error("WEB_SECRET (or NEXTAUTH_SECRET) environment variable is required for signing tokens");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(derived, "hex"), Buffer.from(key, "hex"));
}

function base64url(input: Buffer) {
  return input.toString("base64url");
}

export function signToken(payload: Record<string, any>, expiresInSec = 60 * 60 * 24 * 7) {
  const header = base64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec };
  const payloadPart = base64url(Buffer.from(JSON.stringify(body)));
  const sig = crypto.createHmac("sha256", SECRET as string).update(`${header}.${payloadPart}`).digest();
  return `${header}.${payloadPart}.${base64url(sig)}`;
}

export function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payloadPart, sig] = parts;
  const expected = crypto.createHmac("sha256", SECRET as string).update(`${header}.${payloadPart}`).digest();
    if (!crypto.timingSafeEqual(Buffer.from(sig, "base64url"), expected)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}
