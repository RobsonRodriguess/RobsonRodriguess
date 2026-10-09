// Full-page screenshots via Chrome DevTools Protocol (Edge headless).
// usage: node cdp-shot.mjs <url> <out.jpg> <width> <height> <mobile:0|1> <scale> <quality> [maxHeightCss]
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [url, out, w, h, mobile, scale, quality, maxH] = process.argv.slice(2);
const W = +w, H = +h, isMobile = mobile === "1";
const port = 9300 + Math.floor(Math.random() * 500);
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const prof = mkdtempSync(join(tmpdir(), "edgecdp-"));
const edge = spawn(EDGE, ["--headless=new", "--disable-gpu", "--hide-scrollbars", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); if (targets.length) break; } catch {}
  await sleep(200);
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: isMobile });
if (isMobile) await send("Emulation.setUserAgentOverride", { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" });
await send("Page.navigate", { url });
await sleep(6000);
// scroll through the page so lazy images and reveal-on-scroll animations fire
await evaluate(`(async()=>{const s=ms=>new Promise(r=>setTimeout(r,ms));for(let y=0;y<document.documentElement.scrollHeight;y+=${Math.round(H * 0.6)}){scrollTo(0,y);await s(450);}scrollTo(0,0);await s(1500);})()`);
// freeze viewport-height elements so a tall capture does not stretch them
await evaluate(`(()=>{const vh=innerHeight;for(const el of document.querySelectorAll('body *')){const cs=getComputedStyle(el);const r=el.getBoundingClientRect();if(Math.abs(r.height-vh)<4||/vh|svh|dvh/.test(el.style.minHeight+el.style.height)){el.style.height=r.height+'px';el.style.minHeight=r.height+'px';el.style.maxHeight=r.height+'px';}if(cs.position==='fixed'&&r.top>vh/2){el.style.display='none';}}})()`);
await sleep(800);
let full = await evaluate("document.documentElement.scrollHeight");
if (maxH) full = Math.min(full, +maxH);
const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: +quality, captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: full, scale: +scale } });
writeFileSync(out, Buffer.from(shot.result.data, "base64"));
console.log(`${out}: css ${W}x${full} -> ${Math.round(W * scale)}x${Math.round(full * scale)}, ${Math.round(Buffer.from(shot.result.data, "base64").length / 1024)} KB`);
ws.close(); edge.kill();
process.exit(0);
