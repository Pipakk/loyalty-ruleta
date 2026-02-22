const crypto = require("crypto");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const SECRET = process.env.STAMP_QR_SECRET || "dev-stamp-qr-secret-change-in-production";
const EXPIRY_MS = 10 * 365 * 24 * 60 * 60 * 1000;

function base64UrlEncode(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createStampToken(slug) {
  const exp = Date.now() + EXPIRY_MS;
  const payload = `${slug}:${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest();
  const payloadB64 = base64UrlEncode(Buffer.from(payload, "utf8"));
  const sigB64 = base64UrlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

const slug = "omar-bien-abdaljalil";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fidelidad-digital.vercel.app";
const token = createStampToken(slug);
const claimUrl = `${baseUrl.replace(/\/$/, "")}/b/${slug}/claim-stamp?t=${encodeURIComponent(token)}`;

const outFile = path.join(__dirname, "..", "qr-stamp-omar-bien-abdaljalil.png");

QRCode.toFile(outFile, claimUrl, { width: 400, margin: 2 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("QR de sello guardado en:", outFile);
  console.log("URL:", claimUrl);
});
