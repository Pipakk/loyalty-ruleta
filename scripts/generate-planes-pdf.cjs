/**
 * Genera docs/planes-fidelidad-digital.pdf desde docs/landing-planes.html
 * Requiere: npm install puppeteer
 * Ejecutar: node scripts/generate-planes-pdf.cjs
 */

const path = require("path");
const fs = require("fs");

const htmlPath = path.join(__dirname, "..", "docs", "landing-planes.html");
const pdfPath = path.join(__dirname, "..", "docs", "planes-fidelidad-digital.pdf");

async function main() {
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.error("Instala Puppeteer: npm install puppeteer --save-dev");
    process.exit(1);
  }

  const htmlUrl = "file:///" + htmlPath.replace(/\\/g, "/");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(htmlUrl, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "16px", right: "16px", bottom: "16px", left: "16px" },
  });
  await browser.close();
  console.log("PDF guardado en:", pdfPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
