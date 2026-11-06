import fs from "node:fs";
import { setTimeout as delay } from "node:timers/promises";

const files = ["catalogue.js", "fabricants.js"];
const records = [];
for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const regexes = [
    /"id"\s*:\s*"([^"]+)"[\s\S]{0,3500}?"imageProduit"\s*:\s*"(https?:\/\/[^"]+)"/g,
    /^\s*([a-z0-9-]+)\s*:\s*\{[\s\S]{0,2500}?imageProduit\s*:\s*"(https?:\/\/[^"]+)"/gm
  ];
  for (const re of regexes) {
    for (const m of source.matchAll(re)) {
      records.push({ id: m[1], url: m[2], file });
    }
  }
  const generic = /(?:imageProduit)\s*:\s*"(https?:\/\/[^"]+)"/g;
  for (const m of source.matchAll(generic)) {
    if (!records.some(r => r.url === m[1] && r.file === file)) {
      records.push({ id: "id à associer", url: m[1], file });
    }
  }
}

const byUrl = new Map();
for (const r of records) {
  const entry = byUrl.get(r.url) || { url: r.url, ids: new Set(), files: new Set() };
  if (r.id && r.id !== "id à associer") entry.ids.add(r.id);
  entry.files.add(r.file);
  byUrl.set(r.url, entry);
}
const items = [...byUrl.values()];
const results = new Array(items.length);
let cursor = 0;
async function check(item) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let response, method = "HEAD", error = "";
  try {
    response = await fetch(item.url, { method, redirect: "follow", signal: controller.signal, headers: { "User-Agent": "CrocAmi-ImageAudit/1.0" } });
    let type = response.headers.get("content-type") || "";
    if ([403, 405, 429, 501].includes(response.status) ||
        (response.status >= 200 && response.status < 300 && !type.toLowerCase().startsWith("image/"))) {
      await response.body?.cancel();
      method = "GET";
      response = await fetch(item.url, { method, redirect: "follow", signal: controller.signal, headers: { "User-Agent": "CrocAmi-ImageAudit/1.0", "Range": "bytes=0-63" } });
      type = response.headers.get("content-type") || "";
    }
    const status = response.status;
    let signatureIsImage = false;
    if (method === "GET" && status >= 200 && status < 300) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      const ascii = String.fromCharCode(...bytes.slice(0, 16));
      signatureIsImage = (bytes[0] === 0x89 && ascii.slice(1, 4) === "PNG") ||
        (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
        ascii.startsWith("GIF87a") || ascii.startsWith("GIF89a") ||
        (ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP") ||
        ascii.startsWith("<svg") || ascii.startsWith("<?xml");
    }
    const imageType = type.toLowerCase().startsWith("image/") || signatureIsImage;
    let verdict = status >= 200 && status < 300 && imageType ? "OK" :
      status === 404 || status === 410 ? "LIEN_MORT" :
      status >= 200 && status < 300 ? "TYPE_NON_IMAGE" :
      status === 403 || status === 429 ? "BLOQUE_A_VERIFIER" : "ERREUR_HTTP";
    results[item.index] = { url: item.url, ids: [...item.ids].join("; "), status, contentType: type || (signatureIsImage ? "image/* (signature)" : ""), finalUrl: response.url, method, verdict, error };
    if (method !== "GET") await response.body?.cancel();
  } catch (e) {
    error = e?.name === "AbortError" ? "timeout" : String(e?.message || e);
    results[item.index] = { url: item.url, ids: [...item.ids].join("; "), status: "", contentType: "", finalUrl: "", method, verdict: "NON_VERIFIE", error };
  } finally {
    clearTimeout(timer);
  }
}
async function worker() {
  while (true) {
    const i = cursor++;
    if (i >= items.length) return;
    items[i].index = i;
    await check(items[i]);
    if (i % 20 === 0) await delay(150);
  }
}
await Promise.all(Array.from({ length: 10 }, worker));

fs.mkdirSync("reports", { recursive: true });
const esc = v => '"' + String(v ?? "").replaceAll('"', '""') + '"';
const header = ["url", "product_ids", "http_status", "content_type", "final_url", "method", "verdict", "error"];
const csv = [header.map(esc).join(","), ...results.map(r => [r.url, r.ids, r.status, r.contentType, r.finalUrl, r.method, r.verdict, r.error].map(esc).join(","))].join("\n");
fs.writeFileSync("reports/product-image-audit.csv", csv + "\n");
const summary = {
  checkedAt: new Date().toISOString(),
  uniqueImageUrls: results.length,
  ok: results.filter(r => r.verdict === "OK").length,
  deadLinks: results.filter(r => r.verdict === "LIEN_MORT").length,
  nonImageResponses: results.filter(r => r.verdict === "TYPE_NON_IMAGE").length,
  blockedOrRateLimited: results.filter(r => r.verdict === "BLOQUE_A_VERIFIER").length,
  httpErrors: results.filter(r => r.verdict === "ERREUR_HTTP").length,
  notVerified: results.filter(r => r.verdict === "NON_VERIFIE").length
};
fs.writeFileSync("reports/product-image-audit-summary.json", JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
