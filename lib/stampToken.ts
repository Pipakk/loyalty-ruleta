import crypto from "crypto";

const SECRET = process.env.STAMP_QR_SECRET || "dev-stamp-qr-secret-change-in-production";
const EXPIRY_MS = 10 * 365 * 24 * 60 * 60 * 1000; // 10 años

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Buffer {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return Buffer.from(b64, "base64");
}

/**
 * Genera un token para añadir sello escaneando QR. Incluye slug y expiración.
 */
export function createStampToken(slug: string): string {
  const exp = Date.now() + EXPIRY_MS;
  const payload = `${slug}:${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest();
  const payloadB64 = base64UrlEncode(Buffer.from(payload, "utf8"));
  const sigB64 = base64UrlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

/**
 * Verifica el token y devuelve el slug del bar. Lanza si es inválido.
 */
export function verifyStampToken(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("invalid_token");
  const [payloadB64, sigB64] = parts;
  const payload = base64UrlDecode(payloadB64).toString("utf8");
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest();
  const sig = base64UrlDecode(sigB64);
  if (sig.length !== expectedSig.length || !crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error("invalid_token");
  }
  const [slug, expStr] = payload.split(":");
  const exp = parseInt(expStr, 10);
  if (!slug || Number.isNaN(exp) || exp < Date.now()) throw new Error("invalid_token");
  return slug;
}
