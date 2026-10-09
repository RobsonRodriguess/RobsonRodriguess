// Gera todos os SVGs animados do README em ../assets
// uso: node generator/gen.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "src");
const OUT = join(HERE, "..", "assets");
mkdirSync(OUT, { recursive: true });

const SANS = "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Ubuntu, Arial, sans-serif";
const MONO = "ui-monospace, 'Cascadia Code', 'SF Mono', Consolas, Menlo, 'DejaVu Sans Mono', monospace";
const DISPLAY = "'Arial Black', 'Segoe UI Black', 'Helvetica Neue', Impact, sans-serif";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const img64 = (f, mime = "image/jpeg") => `data:${mime};base64,${readFileSync(join(SRC, f)).toString("base64")}`;
const icon64 = (name) => img64(join("icons", `${name}.svg`), "image/svg+xml");
const n = (v) => Math.round(v * 100) / 100;
const kt = (times, T) => times.map((t) => (Math.min(Math.max(t / T, 0), 1)).toFixed(5)).join(";");

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const svg = (w, h, body, style = "", title = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">` +
  (title ? `<title>${esc(title)}</title>` : "") +
  (style ? `<style>${style.replace(/\s*\n\s*/g, "")}</style>` : "") + body + `</svg>`;

function write(name, content) {
  writeFileSync(join(OUT, name), content);
  console.log(`${name.padEnd(28)} ${(Buffer.byteLength(content) / 1024).toFixed(1)} KB`);
}

const GLOW = (id, std, extra = "") =>
  `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"${extra}><feGaussianBlur stdDeviation="${std}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

function stars(rand, count, w, maxY, color = "#fff") {
  let s = "";
  for (let i = 0; i < count; i++) {
    const d = n(2 + rand() * 4);
    s += `<circle cx="${n(rand() * w)}" cy="${n(rand() * maxY)}" r="${n(0.4 + rand() * 1.3)}" fill="${color}" style="animation:tw ${d}s ease-in-out ${n(-rand() * d)}s infinite"/>`;
  }
  return s;
}

// chão synthwave: linhas que fogem para o horizonte
function grid({ id, w, top, bottom, vx, spacing = 64, lines = 9, dur = 3.4, color = "#e879f9" }) {
  let v = "";
  for (let k = -18; k <= 18; k++) {
    v += `<line x1="${n(vx + k * 7)}" y1="${top}" x2="${n(vx + k * spacing * 1.6)}" y2="${bottom + 40}" stroke="${color}" stroke-opacity=".55" stroke-width="1.1"/>`;
  }
  let h = "";
  for (let i = 0; i < lines; i++) {
    h += `<line x1="0" x2="${w}" y1="${top}" y2="${top}" stroke="${color}" stroke-width="1.4" class="gl-${id}" style="animation-delay:${n((-i * dur) / lines)}s"/>`;
  }
  const style = `.gl-${id}{animation:gl-${id} ${dur}s cubic-bezier(.55,0,1,.45) infinite}
    @keyframes gl-${id}{0%{transform:translateY(0);opacity:0}12%{opacity:.85}100%{transform:translateY(${bottom - top}px);opacity:1}}`;
  const body = `<clipPath id="floor-${id}"><rect x="0" y="${top}" width="${w}" height="${bottom - top}"/></clipPath>
    <g clip-path="url(#floor-${id})">${v}${h}</g>`;
  return { style, body };
}

const BASE_STYLE = `@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
  @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  @keyframes pulse{0%,100%{opacity:.55}50%{opacity:1}}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  .blink{animation:blink 1.1s steps(1) infinite}`;

/* ───────────────────────────── HERO ───────────────────────────── */
function hero() {
  const W = 900, H = 440, HZ = 292, CX = 450;
  const rand = rng(42);
  const g = grid({ id: "h", w: W, top: HZ, bottom: H, vx: CX });

  const mountain = (x0, x1, peak, seed, fill, stroke) => {
    const r = rng(seed);
    let pts = `${x0},${HZ} `;
    const steps = 9;
    for (let i = 1; i < steps; i++) {
      const x = x0 + ((x1 - x0) * i) / steps;
      const mid = 1 - Math.abs(i / steps - 0.5) * 2;
      pts += `${n(x)},${n(HZ - 8 - mid * peak * (0.55 + r() * 0.45))} `;
    }
    pts += `${x1},${HZ}`;
    return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1.4" stroke-linejoin="round"/>`;
  };

  const taglines = [
    "NEXT.JS · REACT · TYPESCRIPT · NODE.JS · POSTGRESQL",
    "SITES E SISTEMAS QUE RODAM NO MUNDO REAL",
    "ADS — IFG  ·  BRASÍLIA-DF  ·  ABERTO A PROJETOS",
  ];

  const style = `${BASE_STYLE}${g.style}
    .name{animation:nm 6s infinite;transform-box:fill-box;transform-origin:center}
    @keyframes nm{0%,86%,90%,100%{transform:none}87%{transform:translateX(4px) skewX(-10deg)}88%{transform:translateX(-3px) skewX(6deg)}89%{transform:none}}
    .gA{animation:gA 6s infinite;mix-blend-mode:screen}.gB{animation:gB 6s infinite;mix-blend-mode:screen}
    @keyframes gA{0%,86%,92%,100%{opacity:0;transform:none}87%{opacity:.9;transform:translate(-6px,-2px)}89%{opacity:.8;transform:translate(5px,1px)}91%{opacity:.6;transform:translate(-2px,0)}}
    @keyframes gB{0%,86%,92%,100%{opacity:0;transform:none}87%{opacity:.9;transform:translate(6px,2px)}89%{opacity:.8;transform:translate(-5px,-1px)}91%{opacity:.6;transform:translate(3px,0)}}
    .halo{animation:pulse 3s ease-in-out infinite}
    .sub{animation:fl 5s infinite}
    @keyframes fl{0%,18%,21%,24%,60%,63%,100%{opacity:1}19%,22%,61%{opacity:.25}}
    .tag{opacity:0;animation:tag 12s infinite;transform-box:fill-box}
    @keyframes tag{0%{opacity:0;transform:translateY(6px)}5%,28%{opacity:1;transform:none}33%,100%{opacity:0;transform:translateY(-6px)}}
    .sun{animation:sun 4s ease-in-out infinite}
    @keyframes sun{0%,100%{opacity:.75}50%{opacity:1}}
    .scanband{animation:band 7s linear infinite}
    @keyframes band{0%{transform:translateY(-90px)}100%{transform:translateY(${H + 90}px)}}
    .shoot{animation:shoot 9s ease-in 2s infinite;opacity:0}
    @keyframes shoot{0%{opacity:0;transform:translate(0,0)}2%{opacity:1}9%{opacity:0;transform:translate(-260px,120px)}100%{opacity:0;transform:translate(-260px,120px)}}
    .start{animation:blink 1.2s steps(1) infinite}
    .arrow{animation:bob 1.4s ease-in-out infinite}
    .pwbg{animation:pwbg 1.4s ease forwards}
    @keyframes pwbg{0%,40%{opacity:1}100%{opacity:0}}
    .pwl{transform-box:fill-box;transform-origin:center;animation:pwl 1.4s ease forwards}
    @keyframes pwl{0%{transform:scale(0,1);opacity:1}30%{transform:scale(1,1);opacity:1}55%{transform:scale(1,60);opacity:0}100%{opacity:0}}`;

  const nameAttrs = `x="${CX}" y="124" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="60" textLength="730" lengthAdjust="spacingAndGlyphs"`;

  const body = `<defs>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="20"/></clipPath>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04010b"/><stop offset=".55" stop-color="#16052c"/><stop offset=".66" stop-color="#3a0b5c"/><stop offset=".665" stop-color="#0c0218"/><stop offset="1" stop-color="#000"/></linearGradient>
    <linearGradient id="sunG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".45" stop-color="#fb923c"/><stop offset="1" stop-color="#db2777"/></linearGradient>
    <linearGradient id="chrome" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="126"><stop offset="0" stop-color="#a5f3fc"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".52" stop-color="#5b21b6"/><stop offset=".68" stop-color="#c026d3"/><stop offset="1" stop-color="#fbcfe8"/></linearGradient>
    <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <linearGradient id="bandG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".28"/></pattern>
    <mask id="sunMask"><rect x="0" y="0" width="${W}" height="${HZ}" fill="#fff"/>${[254, 264, 273, 281, 288].map((y, i) => `<rect x="300" y="${y}" width="300" height="${2 + i * 1.3}" fill="#000"/>`).join("")}</mask>
    ${GLOW("glow", 3)}${GLOW("glowBig", 9)}${GLOW("glowSun", 18)}
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars(rand, 95, W, HZ - 20)}
    <g class="shoot"><line x1="780" y1="40" x2="840" y2="12" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></g>
    <g class="sun"><circle cx="${CX}" cy="${HZ + 26}" r="118" fill="url(#sunG)" filter="url(#glowSun)" mask="url(#sunMask)" opacity=".55"/></g>
    <circle cx="${CX}" cy="${HZ + 26}" r="112" fill="url(#sunG)" mask="url(#sunMask)"/>
    ${mountain(-20, 360, 70, 3, "#1d0638", "#7e22ce")}
    ${mountain(540, 920, 76, 9, "#1d0638", "#7e22ce")}
    ${mountain(-40, 250, 44, 5, "#0f0220", "#c026d3")}
    ${mountain(650, 940, 50, 11, "#0f0220", "#c026d3")}
    <rect x="0" y="${HZ}" width="${W}" height="${H - HZ}" fill="#08010f"/>
    ${g.body}
    <line x1="0" x2="${W}" y1="${HZ}" y2="${HZ}" stroke="#f0abfc" stroke-width="2" filter="url(#glow)"/>

    <g font-family="${MONO}" font-size="13" letter-spacing="2" font-weight="700">
      <text x="28" y="34" fill="#ff2e97" class="blink">1UP</text><text x="70" y="34" fill="#fff">ROBSON</text>
      <text x="${CX}" y="34" fill="#ff2e97" text-anchor="middle">HI-SCORE <tspan fill="#fff">∞</tspan></text>
      <text x="${W - 28}" y="34" fill="#22d3ee" text-anchor="end">CREDIT <tspan fill="#fff">01</tspan></text>
    </g>

    <text ${nameAttrs} fill="#c026d3" filter="url(#glowBig)" class="halo">ROBSON RODRIGUES</text>
    <text ${nameAttrs} fill="#22d3ee" class="gA">ROBSON RODRIGUES</text>
    <text ${nameAttrs} fill="#ff2e97" class="gB">ROBSON RODRIGUES</text>
    <text ${nameAttrs} fill="url(#chrome)" stroke="#fff" stroke-opacity=".35" stroke-width=".8" class="name">ROBSON RODRIGUES</text>

    <text x="${CX}" y="164" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="19" letter-spacing="9" fill="#67e8f9" filter="url(#glow)" class="sub" textLength="470" lengthAdjust="spacing">FULL STACK DEVELOPER</text>
    <g font-family="${MONO}" font-size="13" letter-spacing="2" fill="#f5d0fe" text-anchor="middle">
      ${taglines.map((t, i) => `<text x="${CX}" y="196" class="tag" style="animation-delay:${i * 4}s">${esc(t)}</text>`).join("")}
    </g>

    <g font-family="${MONO}" font-weight="700" text-anchor="middle">
      <text x="${CX}" y="398" font-size="17" letter-spacing="7" fill="#fde047" filter="url(#glow)" class="start">PRESS START</text>
      <text x="${CX}" y="422" font-size="10" letter-spacing="4" fill="#f0abfc" class="arrow">▼ ROLE PARA JOGAR ▼</text>
    </g>

    <rect width="${W}" height="${H}" fill="url(#scan)"/>
    <rect width="${W}" height="90" fill="url(#bandG)" class="scanband"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    <rect class="pwbg" width="${W}" height="${H}" fill="#000"/>
    <rect class="pwl" x="0" y="${H / 2 - 1}" width="${W}" height="2" fill="#fff"/>
  </g>
  <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="19.5" stroke="#7f2ccb" stroke-opacity=".7" stroke-width="1.5"/>`;
  write("hero.svg", svg(W, H, body, style, "Robson Rodrigues — Full Stack Developer"));
}

/* ───────────────────────────── NAV ───────────────────────────── */
function navButtons() {
  const items = [["01", "SOBRE"], ["02", "PROJETOS"], ["03", "ARSENAL"], ["04", "PLACAR"], ["05", "CONTATO"]];
  items.forEach(([num, label], i) => {
    const W = 164, H = 46;
    const style = `${BASE_STYLE}
      .run{stroke-dasharray:16 84;animation:run 3.2s linear infinite;animation-delay:${n(-i * 0.64)}s}
      @keyframes run{to{stroke-dashoffset:-100}}
      .arr{animation:nudge 1.2s ease-in-out infinite;animation-delay:${n(i * 0.15)}s}
      @keyframes nudge{0%,100%{transform:translateX(0);opacity:.5}50%{transform:translateX(3px);opacity:1}}`;
    const body = `<defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#ff2e97"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>${GLOW("gl", 2)}</defs>
      <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="11" fill="#0d0618" stroke="#3b1764" stroke-width="1.5"/>
      <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="11" pathLength="100" stroke="url(#lg)" stroke-width="2.2" stroke-linecap="round" class="run" filter="url(#gl)"/>
      <text x="18" y="28" font-family="${MONO}" font-size="11" font-weight="700" fill="#ff2e97">${num}</text>
      <text x="44" y="28.5" font-family="${MONO}" font-size="14" font-weight="700" letter-spacing="2" fill="#f5f3ff">${label}</text>
      <text x="${W - 18}" y="28" font-family="${MONO}" font-size="11" fill="#22d3ee" text-anchor="end" class="arr">▶</text>`;
    write(`nav-${label.toLowerCase()}.svg`, svg(W, H, body, style, label));
  });
}

/* ───────────────────────────── TÍTULOS ───────────────────────────── */
function titles() {
  const list = [
    ["sobre", "01", "SOBRE MIM", "PLAYER 1 · STATUS"],
    ["destaque", "02", "PROJETO LENDÁRIO", "MISSÃO PRINCIPAL"],
    ["colecao", "03", "COLEÇÃO DE PROJETOS", "CARTAS DESBLOQUEADAS"],
    ["arsenal", "04", "ARSENAL", "SISTEMA ORBITAL DE STACK"],
    ["placar", "05", "PLACAR", "DADOS AO VIVO DO GITHUB"],
    ["contato", "06", "MULTIPLAYER", "CHAMA PRO CO-OP"],
  ];
  list.forEach(([id, num, text, sub], i) => {
    const W = 900, H = 66;
    const style = `${BASE_STYLE}
      .t{animation:fl 7s infinite;animation-delay:${i * 0.9}s}
      @keyframes fl{0%,40%,43%,46%,100%{opacity:1}41%,44%{opacity:.35}}
      .dot{animation:sweep 4.5s cubic-bezier(.6,0,.4,1) infinite;animation-delay:${n(i * 0.4)}s}
      @keyframes sweep{0%{transform:translateX(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateX(840px);opacity:0}}`;
    const body = `<defs>
        <clipPath id="c"><rect width="${W}" height="${H}" rx="14"/></clipPath>
        <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff2e97"/><stop offset="1" stop-color="#7f2ccb"/></linearGradient>
        <linearGradient id="bg" x1="0" x2="1"><stop offset="0" stop-color="#1a0a2e"/><stop offset=".6" stop-color="#0c0616"/><stop offset="1" stop-color="#0c0616"/></linearGradient>
        <radialGradient id="dg"><stop offset="0" stop-color="#f0abfc"/><stop offset="1" stop-color="#f0abfc" stop-opacity="0"/></radialGradient>
        ${GLOW("gl", 4)}
      </defs>
      <g clip-path="url(#c)">
        <rect width="${W}" height="${H}" fill="url(#bg)"/>
        <rect width="6" height="${H}" fill="url(#acc)"/>
        <line x1="24" x2="${W - 24}" y1="56" y2="56" stroke="#2c1450" stroke-width="1"/>
        <g class="dot"><ellipse cx="30" cy="56" rx="38" ry="2.4" fill="url(#dg)"/></g>
      </g>
      <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="13.5" stroke="#2c1450"/>
      <text x="26" y="40" font-family="${MONO}" font-size="14" font-weight="700" fill="#ff2e97">${num} //</text>
      <text x="86" y="42" font-family="${DISPLAY}" font-weight="900" font-size="25" letter-spacing="2" fill="#fff" filter="url(#gl)" class="t">${esc(text)}</text>
      <text x="${W - 26}" y="39" font-family="${MONO}" font-size="11.5" letter-spacing="2.5" fill="#a78bfa" text-anchor="end">${esc(sub)} <tspan fill="#22d3ee" class="blink">█</tspan></text>`;
    write(`title-${id}.svg`, svg(W, H, body, style, text));
  });
}

/* ───────────────────────────── TERMINAL ───────────────────────────── */
function terminal() {
  const W = 900, H = 372, FS = 15, CW = 9, LH = 25, X0 = 28, Y0 = 80, CMDX = X0 + 5 * CW;
  const CHAR = 0.055;
  const lines = [
    { cmd: "whoami" },
    { out: [["Robson Rodrigues", "#ffffff", 700], [" · Full Stack Developer · Brasília-DF", "#c4b5fd"]] },
    { cmd: "cat sobre.txt" },
    { out: [["Crio produtos digitais completos: do front-end animado ao", "#d4d4d8"]] },
    { out: [["back-end seguro, com pagamentos, autenticação e painel admin.", "#d4d4d8"]] },
    { out: [["Gosto de projeto que sai do papel e ", "#d4d4d8"], ["vai pro ar.", "#f0abfc", 700]] },
    { cmd: "ls conquistas/" },
    { out: [["ads-ifg.diploma", "#22d3ee"], ["   clientes-reais/", "#a78bfa"], ["   deploys-em-producao/", "#a78bfa"], ["   5+anos-de-xp", "#fde047"]] },
    { cmd: "echo $STATUS" },
    { out: [["● ", "#4ade80"], ["aberto a projetos remotos e freelas", "#4ade80"]] },
    { prompt: true },
  ];

  // linha do tempo
  let t = 0.6;
  const cursor = []; // [time, x, y]
  lines.forEach((l, i) => {
    l.y = Y0 + i * LH;
    if (l.cmd) {
      t += 0.5;
      l.start = t;
      cursor.push([t, CMDX, l.y]);
      for (let k = 1; k <= l.cmd.length; k++) cursor.push([t + k * CHAR, CMDX + k * CW, l.y]);
      t += l.cmd.length * CHAR + 0.35;
    } else if (l.out) {
      l.start = t;
      t += 0.12;
      if (!lines[i + 1] || !lines[i + 1].out) t += 0.9;
    } else {
      t += 0.3;
      l.start = t;
      cursor.push([t, CMDX, l.y]);
    }
  });
  const T = n(t + 5.5);
  const fadeA = T - 0.9, fadeB = T - 0.35;
  const show = (start) => `<animate attributeName="opacity" calcMode="discrete" dur="${T}s" repeatCount="indefinite" values="0;1" keyTimes="0;${kt([start], T)}"/>`;
  const prompt = (y) => `<text x="${X0}" y="${y}"><tspan fill="#ff2e97">➜</tspan><tspan fill="#22d3ee" dx="9">~</tspan></text>`;

  let content = "";
  let clips = "";
  lines.forEach((l, i) => {
    if (l.cmd) {
      const times = [0, l.start], vals = [0, 0];
      for (let k = 1; k <= l.cmd.length; k++) { times.push(l.start + k * CHAR); vals.push(k * CW); }
      clips += `<clipPath id="ty${i}"><rect x="${CMDX - 1}" y="${l.y - FS}" height="${FS + 8}" width="0"><animate attributeName="width" calcMode="discrete" dur="${T}s" repeatCount="indefinite" values="${vals.join(";")}" keyTimes="${kt(times, T)}"/></rect></clipPath>`;
      content += `<g opacity="0">${show(l.start)}${prompt(l.y)}</g>`;
      content += `<text x="${CMDX}" y="${l.y}" fill="#f5f3ff" clip-path="url(#ty${i})" textLength="${l.cmd.length * CW}" lengthAdjust="spacingAndGlyphs">${esc(l.cmd)}</text>`;
    } else if (l.out) {
      content += `<g opacity="0">${show(l.start)}<text x="${X0}" y="${l.y}">${l.out.map(([s, c, w]) => `<tspan fill="${c}"${w ? ` font-weight="${w}"` : ""}>${esc(s).replace(/ {2,}/g, (m) => " ".repeat(m.length))}</tspan>`).join("")}</text></g>`;
    } else {
      content += `<g opacity="0">${show(l.start)}${prompt(l.y)}</g>`;
    }
  });

  const ct = cursor.map((c) => c[0]);
  const cursorEl = `<g class="blink"><rect width="${CW}" height="${FS + 3}" fill="#f0abfc" opacity=".85" x="${CMDX}" y="${Y0 - FS + 1}">
      <animate attributeName="x" calcMode="discrete" dur="${T}s" repeatCount="indefinite" values="${[CMDX, ...cursor.map((c) => c[1])].join(";")}" keyTimes="${kt([0, ...ct], T)}"/>
      <animate attributeName="y" calcMode="discrete" dur="${T}s" repeatCount="indefinite" values="${[Y0, ...cursor.map((c) => c[2])].map((y) => y - FS + 1).join(";")}" keyTimes="${kt([0, ...ct], T)}"/>
    </rect></g>`;

  const style = `${BASE_STYLE}`;
  const body = `<defs>
      <clipPath id="win"><rect width="${W}" height="${H}" rx="14"/></clipPath>
      <linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="#1d1030"/><stop offset="1" stop-color="#140b22"/></linearGradient>
      <radialGradient id="glowbg" cx=".85" cy="0" r="1"><stop offset="0" stop-color="#7f2ccb" stop-opacity=".22"/><stop offset=".6" stop-color="#7f2ccb" stop-opacity="0"/></radialGradient>
      <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".22"/></pattern>
      ${clips}
    </defs>
    <g clip-path="url(#win)">
      <rect width="${W}" height="${H}" fill="#0b0814"/>
      <rect width="${W}" height="${H}" fill="url(#glowbg)"/>
      <rect width="${W}" height="38" fill="url(#bar)"/>
      <line x1="0" x2="${W}" y1="38" y2="38" stroke="#2c1a45"/>
      <circle cx="22" cy="19" r="6" fill="#ff5f57"/><circle cx="42" cy="19" r="6" fill="#febc2e"/><circle cx="62" cy="19" r="6" fill="#28c840"/>
      <text x="${W / 2}" y="23.5" text-anchor="middle" font-family="${MONO}" font-size="12" fill="#8b80a8">robson@brasilia: ~/sobre-mim — zsh</text>
      <g font-family="${MONO}" font-size="${FS}" xml:space="preserve" style="white-space:pre">
        <g>${content}${cursorEl}
          <animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;${kt([fadeA, fadeB], T)};1"/>
        </g>
      </g>
      <rect width="${W}" height="${H}" fill="url(#scan)"/>
    </g>
    <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="13.5" stroke="#3b1764" stroke-width="1.5"/>`;
  write("terminal.svg", svg(W, H, body, style, "whoami — Robson Rodrigues, Full Stack Developer em Brasília-DF"));
}

/* ───────────────────────────── CONQUISTAS ───────────────────────────── */
function achievements() {
  const W = 900, H = 122;
  const list = [
    ["Formado em ADS — IFG", "Análise e Desenvolvimento de Sistemas"],
    ["Primeiro site de cliente no ar", "Gabriela Decorações · 18 anos de mercado"],
    ["Pix automático em produção", "Candangos Shop · Supabase Edge Functions"],
    ["TCC defendido", "Mind Health · tecnologia e saúde mental"],
    ["Fez um jogo inteiro com IA", "Guns & Dragons · C++ e SFML 3.0"],
    ["Montou o primeiro PC aos 12", "e nunca mais desligou"],
  ];
  const STEP = 3.6, T = STEP * list.length, p = (s) => n((s / T) * 100);
  const style = `${BASE_STYLE}
    .toast{opacity:0;animation:toast ${T}s infinite both}
    @keyframes toast{0%{opacity:0;transform:translateY(22px)}${p(0.35)}%{opacity:1;transform:translateY(0)}${p(STEP - 0.45)}%{opacity:1;transform:translateY(0)}${p(STEP)}%{opacity:0;transform:translateY(-22px)}100%{opacity:0;transform:translateY(-22px)}}
    .shine{animation:shine ${T}s infinite both}
    @keyframes shine{0%,${p(0.5)}%{transform:translateX(0)}${p(1.6)}%,100%{transform:translateX(760px)}}
    .ring{transform-box:fill-box;transform-origin:center;animation:spin 2.4s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spark{animation:tw 1.6s ease-in-out infinite}`;
  const trophy = `<g fill="#2a1a00">
      <path d="M-11-12H11V-4C11 5 5 9 0 9S-11 5-11-4Z"/>
      <path d="M-11-9H-17C-17-1-13 2-9 2M11-9H17C17-1 13 2 9 2" stroke="#2a1a00" stroke-width="3" fill="none"/>
      <rect x="-2.5" y="8" width="5" height="6"/><rect x="-9" y="13" width="18" height="4.5" rx="1.5"/></g>`;
  const toasts = list.map(([title, sub], i) => `<g class="toast" style="animation-delay:${n(i * STEP)}s">
      <rect x="150" y="19" width="600" height="84" rx="42" fill="#120a1f" stroke="url(#edge)" stroke-width="1.8"/>
      <g clip-path="url(#pill)"><rect x="80" y="19" width="70" height="84" fill="url(#shineG)" transform="skewX(-20)" class="shine" style="animation-delay:${n(i * STEP)}s"/></g>
      <circle cx="194" cy="61" r="30" fill="url(#gold)"/>
      <circle cx="194" cy="61" r="34" stroke="#fde047" stroke-width="2" stroke-dasharray="30 184" stroke-linecap="round" class="ring"/>
      <g transform="translate(194 62)">${trophy}</g>
      <text x="240" y="47" font-family="${MONO}" font-size="10.5" font-weight="700" letter-spacing="3" fill="#fbbf24">CONQUISTA DESBLOQUEADA</text>
      <text x="240" y="72" font-family="${SANS}" font-size="19" font-weight="700" fill="#fff">${esc(title)}</text>
      <text x="240" y="91" font-family="${SANS}" font-size="12.5" fill="#a1a1aa">${esc(sub)}</text>
      <g transform="translate(694 61)"><circle r="17" fill="#1f1530" stroke="#4c2a7a"/><text y="5" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" fill="#fde047">G</text></g>
      <text x="${694 - 24}" y="66" text-anchor="end" font-family="${MONO}" font-size="15" font-weight="700" fill="#fff">100</text>
    </g>`).join("");
  const sparks = [[160, 30], [228, 22], [168, 100], [232, 104], [742, 30]].map(([x, y], i) =>
    `<path d="M${x} ${y - 5}L${x + 1.4} ${y - 1.4}L${x + 5} ${y}L${x + 1.4} ${y + 1.4}L${x} ${y + 5}L${x - 1.4} ${y + 1.4}L${x - 5} ${y}L${x - 1.4} ${y - 1.4}Z" fill="#fde047" class="spark" style="animation-delay:${n(i * 0.3)}s"/>`).join("");
  const body = `<defs>
      <linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset=".5" stop-color="#7f2ccb"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
      <radialGradient id="gold" cx=".35" cy=".3"><stop offset="0" stop-color="#fff7cc"/><stop offset=".5" stop-color="#fbbf24"/><stop offset="1" stop-color="#b45309"/></radialGradient>
      <linearGradient id="shineG" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="pill"><rect x="150" y="19" width="600" height="84" rx="42"/></clipPath>
    </defs>
    ${toasts}${sparks}`;
  write("achievements.svg", svg(W, H, body, style, "Conquistas desbloqueadas"));
}

/* ───────────────────────────── PROJETO EM DESTAQUE ───────────────────────────── */
function featured() {
  const W = 900, H = 560, T = 24;
  const rand = rng(77);
  // notebook
  const VX = 52, VY = 80, VW = 596, VH = 342, IMG_H = Math.round((3080 * VW) / 792);
  const maxD = IMG_H - VH;
  // celular
  const PX = 708, PY = 158, PW = 160, PH = 344, PIMG_H = Math.round((4464 * PW) / 242);
  const maxM = PIMG_H - PH;
  const url = "gabrieladecoracoes.com.br";

  const scrollAnim = (stops) => {
    const times = stops.map((s) => s[0]), vals = stops.map((s) => `0 ${-s[1]}`);
    const splines = stops.slice(1).map((s, i) => (stops[i][1] === s[1] ? "0 0 1 1" : ".65 0 .35 1")).join(";");
    return `<animateTransform attributeName="transform" type="translate" dur="${T}s" repeatCount="indefinite" calcMode="spline" values="${vals.join(";")}" keyTimes="${kt(times, T)}" keySplines="${splines}"/>`;
  };
  const deskScroll = scrollAnim([[0, 0], [4.3, 0], [6.3, 560], [7.5, 560], [9.5, 1100], [10.7, 1100], [12.7, 1600], [13.9, 1600], [15.9, maxD], [18.5, maxD], [20, 0], [T, 0]]);
  const mobScroll = scrollAnim([[0, 0], [4.6, 0], [6.6, 700], [8, 700], [10, 1400], [11.5, 1400], [13.5, 2100], [15, 2100], [17, maxM], [19, maxM], [20.5, 0], [T, 0]]);

  // digitação da URL
  const CHAR = 0.05, UCW = 6.9, UX = 146;
  const ut = [0, 0.3], uv = [0, 0];
  for (let k = 1; k <= url.length; k++) { ut.push(0.3 + k * CHAR); uv.push(n(k * UCW)); }
  ut.push(23.5); uv.push(0);

  // cursor: caminha até "VER PROJETOS" e clica
  const BX = 350, BY = 332;
  const cur = [[0, 560, 400], [2.2, 560, 400], [3.8, BX, BY], [4.3, BX, BY], [5.2, 470, 300], [9, 430, 260], [13, 520, 330], [17, 460, 280], [20, 560, 400], [T, 560, 400]];

  const chips = ["React", "TypeScript", "Vite", "Tailwind", "shadcn/ui", "Vercel"];
  let cx = 40;
  const chipEls = chips.map((c, i) => {
    const w = c.length * 7.6 + 26;
    const el = `<g style="animation:bob 2.6s ease-in-out ${n(-i * 0.4)}s infinite"><rect x="${n(cx)}" y="490" width="${n(w)}" height="28" rx="14" fill="#160b28" stroke="#4c2a7a"/><text x="${n(cx + w / 2)}" y="508.5" text-anchor="middle" font-family="${MONO}" font-size="12" fill="#e9d5ff">${esc(c)}</text></g>`;
    cx += w + 10;
    return el;
  }).join("");

  let particles = "";
  for (let i = 0; i < 26; i++) {
    const d = n(5 + rand() * 6);
    particles += `<circle cx="${n(rand() * W)}" cy="${n(80 + rand() * 460)}" r="${n(0.8 + rand() * 1.6)}" fill="${rand() > 0.5 ? "#c084fc" : "#22d3ee"}" style="animation:rise ${d}s linear ${n(-rand() * d)}s infinite"/>`;
  }

  const style = `${BASE_STYLE}
    @keyframes rise{0%{transform:translateY(0);opacity:0}15%{opacity:.8}100%{transform:translateY(-90px);opacity:0}}
    .live{animation:pulse 1.4s ease-in-out infinite}
    .ping{transform-box:fill-box;transform-origin:center;animation:ping 1.6s ease-out infinite}
    @keyframes ping{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.6);opacity:0}}
    .legend{animation:shimmer 3s ease-in-out infinite}
    @keyframes shimmer{0%,100%{opacity:.85}50%{opacity:1}}`;

  const body = `<defs>
      <clipPath id="panel"><rect width="${W}" height="${H}" rx="20"/></clipPath>
      <radialGradient id="bg" cx=".38" cy=".42" r=".75"><stop offset="0" stop-color="#2b0b4d"/><stop offset=".7" stop-color="#0b0614"/></radialGradient>
      <pattern id="gridp" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="#7f2ccb" stroke-opacity=".12"/></pattern>
      <linearGradient id="lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a3a"/><stop offset="1" stop-color="#16161f"/></linearGradient>
      <linearGradient id="base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a4c"/><stop offset="1" stop-color="#14141c"/></linearGradient>
      <linearGradient id="goldG" x1="0" x2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#fde68a"/>
        <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0" dur="3s" repeatCount="indefinite"/></linearGradient>
      <clipPath id="vp"><rect x="${VX}" y="${VY}" width="${VW}" height="${VH}"/></clipPath>
      <clipPath id="ph"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="24"/></clipPath>
      <clipPath id="urlc"><rect x="${UX - 1}" y="56" height="18" width="0"><animate attributeName="width" calcMode="discrete" dur="${T}s" repeatCount="indefinite" values="${uv.join(";")}" keyTimes="${kt(ut, T)}"/></rect></clipPath>
      ${GLOW("glow", 6)}${GLOW("soft", 14)}
    </defs>
    <g clip-path="url(#panel)">
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <rect width="${W}" height="${H}" fill="url(#gridp)"/>
      ${particles}

      <!-- notebook -->
      <rect x="40" y="34" width="620" height="400" rx="16" fill="#7f2ccb" opacity=".35" filter="url(#soft)"/>
      <rect x="40" y="34" width="620" height="400" rx="16" fill="url(#lid)" stroke="#43435a"/>
      <circle cx="350" cy="41" r="2" fill="#555"/>
      <rect x="${VX}" y="46" width="${VW}" height="376" rx="5" fill="#0a0a0f"/>
      <rect x="${VX}" y="46" width="${VW}" height="34" fill="#1d1d29"/>
      <circle cx="68" cy="63" r="5" fill="#ff5f57"/><circle cx="84" cy="63" r="5" fill="#febc2e"/><circle cx="100" cy="63" r="5" fill="#28c840"/>
      <rect x="120" y="53" width="430" height="21" rx="10.5" fill="#2a2a3a"/>
      <g transform="translate(131 58)" fill="#4ade80"><rect x="0" y="4.5" width="8" height="6.5" rx="1.2"/><path d="M1.6 4.5V3a2.4 2.4 0 0 1 4.8 0v1.5" stroke="#4ade80" stroke-width="1.4" fill="none"/></g>
      <text x="${UX}" y="68" font-family="${MONO}" font-size="11.5" fill="#e4e4e7" clip-path="url(#urlc)" textLength="${n(url.length * UCW)}" lengthAdjust="spacingAndGlyphs">${url}</text>
      <path d="M574 58a5.5 5.5 0 1 0 5.5 5.5" stroke="#8b8ba0" stroke-width="1.5" fill="none"/><path d="M579.5 58v4h-4" stroke="#8b8ba0" stroke-width="1.5" fill="none"/>
      <g clip-path="url(#vp)">
        <image href="${img64("gab-d.jpg")}" x="${VX}" y="${VY}" width="${VW}" height="${IMG_H}" preserveAspectRatio="none">${deskScroll}</image>
        <rect x="${VX}" y="${VY}" width="${VW}" height="${VH}" fill="#0a0a0f">
          <animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" values="1;1;0;0;1;1" keyTimes="0;${kt([1.8, 2.3, 23.1, 23.5], T)};1"/>
        </rect>
      </g>
      <rect x="${VX}" y="78" height="2.5" width="0" fill="#c084fc" filter="url(#glow)">
        <animate attributeName="width" dur="${T}s" repeatCount="indefinite" values="0;0;${VW};${VW}" keyTimes="0;${kt([1.6, 2.3], T)};1"/>
        <animate attributeName="opacity" calcMode="discrete" dur="${T}s" repeatCount="indefinite" values="0;1;0" keyTimes="0;${kt([1.6, 2.5], T)}"/>
      </rect>
      <!-- clique -->
      <circle cx="${BX}" cy="${BY}" r="4" stroke="#fff" stroke-width="2" fill="none" opacity="0">
        <animate attributeName="r" dur="${T}s" repeatCount="indefinite" values="4;4;26;26" keyTimes="0;${kt([3.9, 4.5], T)};1"/>
        <animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" values="0;0;.9;0;0" keyTimes="0;${kt([3.85, 3.9, 4.5], T)};1"/>
      </circle>
      <g opacity="0">
        <animate attributeName="opacity" calcMode="discrete" dur="${T}s" repeatCount="indefinite" values="0;1;0" keyTimes="0;${kt([2.1, 20.5], T)}"/>
        <animateTransform attributeName="transform" type="translate" dur="${T}s" repeatCount="indefinite" calcMode="spline" values="${cur.map((c) => `${c[1]} ${c[2]}`).join(";")}" keyTimes="${kt(cur.map((c) => c[0]), T)}" keySplines="${cur.slice(1).map(() => ".45 0 .3 1").join(";")}"/>
        <path d="M0 0V17L4.6 12.6L7.6 19.4L10.4 18.2L7.5 11.6H13.6Z" fill="#fff" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/>
      </g>
      <path d="M20 434H680L702 452Q704 460 696 460H4Q-4 460-2 452Z" fill="url(#base)"/>
      <rect x="300" y="434" width="100" height="6" rx="3" fill="#0e0e14"/>

      <!-- celular -->
      <rect x="${PX - 8}" y="${PY - 8}" width="${PW + 16}" height="${PH + 16}" rx="32" fill="#22d3ee" opacity=".22" filter="url(#soft)"/>
      <rect x="${PX - 8}" y="${PY - 8}" width="${PW + 16}" height="${PH + 16}" rx="32" fill="#101018" stroke="#4a4a60" stroke-width="2"/>
      <rect x="${PX + PW + 8}" y="${PY + 70}" width="3" height="44" rx="1.5" fill="#4a4a60"/>
      <rect x="${PX - 11}" y="${PY + 60}" width="3" height="26" rx="1.5" fill="#4a4a60"/><rect x="${PX - 11}" y="${PY + 94}" width="3" height="26" rx="1.5" fill="#4a4a60"/>
      <g clip-path="url(#ph)">
        <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="#0a0a0f"/>
        <image href="${img64("gab-m.jpg")}" x="${PX}" y="${PY}" width="${PW}" height="${PIMG_H}" preserveAspectRatio="none">${mobScroll}</image>
        <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="#0a0a0f">
          <animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" values="1;1;0;0;1;1" keyTimes="0;${kt([2.2, 2.8, 23.1, 23.5], T)};1"/>
        </rect>
      </g>
      <rect x="${PX + PW / 2 - 28}" y="${PY + 8}" width="56" height="15" rx="7.5" fill="#000"/>

      <!-- etiquetas -->
      <g class="legend"><rect x="700" y="40" width="176" height="32" rx="16" fill="#1f1400" stroke="url(#goldG)" stroke-width="1.6"/>
      <text x="788" y="61" text-anchor="middle" font-family="${MONO}" font-size="12.5" font-weight="700" letter-spacing="3" fill="#fde68a">★ LENDÁRIO</text></g>
      <rect x="700" y="84" width="176" height="32" rx="16" fill="#06210f" stroke="#22c55e" stroke-width="1.4"/>
      <circle cx="724" cy="100" r="4.5" fill="#4ade80" class="ping"/><circle cx="724" cy="100" r="4.5" fill="#4ade80" class="live"/>
      <text x="798" y="105" text-anchor="middle" font-family="${MONO}" font-size="12.5" font-weight="700" letter-spacing="2" fill="#86efac">NO AR</text>
      ${chipEls}
      <text x="${W - 24}" y="540" text-anchor="end" font-family="${MONO}" font-size="11" letter-spacing="2" fill="#a78bfa">CLIQUE PARA VISITAR ↗</text>
    </g>
    <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="19.5" stroke="#7f2ccb" stroke-opacity=".6" stroke-width="1.5"/>`;
  write("featured-gabriela.svg", svg(W, H, body, style, "Gabriela Decorações — site no ar, versão desktop e mobile"));
}

/* ───────────────────────────── CARTAS DE PROJETO ───────────────────────────── */
const RARITY = {
  lendario: { label: "LENDÁRIO", c1: "#fde68a", c2: "#f59e0b", text: "#1f1400" },
  epico: { label: "ÉPICO", c1: "#e879f9", c2: "#7c3aed", text: "#1a0330" },
  raro: { label: "RARO", c1: "#67e8f9", c2: "#2563eb", text: "#03142e" },
  caotico: { label: "CAÓTICO", c1: "#fca5a5", c2: "#dc2626", text: "#2a0505" },
  academico: { label: "ACADÊMICO", c1: "#86efac", c2: "#059669", text: "#032013" },
};

function sisuArt(x, y, w, h) {
  const bars = [0.42, 0.66, 0.5, 0.82, 0.58, 0.9, 0.7, 0.48, 0.76];
  const bw = 26, gap = 14, bx0 = x + 150;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sisuBg)"/>
    <g stroke="#60a5fa" stroke-opacity=".14">${Array.from({ length: 10 }, (_, i) => `<line x1="${x}" x2="${x + w}" y1="${y + i * 18}" y2="${y + i * 18}"/>`).join("")}</g>
    ${bars.map((v, i) => `<rect x="${bx0 + i * (bw + gap)}" y="${n(y + h - 14 - v * (h - 40))}" width="${bw}" height="${n(v * (h - 40))}" rx="4" fill="url(#barG)" class="bar" style="animation-delay:${n(i * 0.12)}s"/>`).join("")}
    <line x1="${x + 140}" x2="${x + w - 6}" y1="${y + 62}" y2="${y + 62}" stroke="#f472b6" stroke-width="2" stroke-dasharray="6 5" class="cut"/>
    <rect x="${x + w - 104}" y="${y + 45}" width="98" height="15" rx="3" fill="#071433" class="cut"/><text x="${x + w - 10}" y="${y + 56}" text-anchor="end" font-family="${MONO}" font-size="10" font-weight="700" letter-spacing="1.5" fill="#f9a8d4" class="cut">NOTA DE CORTE</text>
    <text x="${x + 18}" y="${y + 92}" font-family="${DISPLAY}" font-weight="900" font-size="30" fill="#fff">SISU</text>
    <text x="${x + 18}" y="${y + 120}" font-family="${DISPLAY}" font-weight="900" font-size="30" fill="#60a5fa">2026</text>
    <text x="${x + 18}" y="${y + 142}" font-family="${MONO}" font-size="10" letter-spacing="2" fill="#93c5fd">SIMULADOR</text>`;
}

function card({ id, title, desc, chips, rarity, badge, thumb, live }, i) {
  const W = 420, H = 300, R = RARITY[rarity];
  const pillW = R.label.length * 8.2 + 34;
  const badgeW = badge.length * 7.4 + (live ? 34 : 22);
  let cx = 22;
  const chipEls = chips.map((c) => {
    const w = c.length * 6.9 + 18;
    const el = `<rect x="${n(cx)}" y="267" width="${n(w)}" height="21" rx="10.5" fill="#1a1029" stroke="#3b2463"/><text x="${n(cx + w / 2)}" y="281.5" text-anchor="middle" font-family="${MONO}" font-size="11" fill="#d8b4fe">${esc(c)}</text>`;
    cx += w + 7;
    return el;
  }).join("");
  const style = `${BASE_STYLE}
    .holo{animation:holo 7s ease-in-out infinite;animation-delay:${n(i * 1.1)}s}
    @keyframes holo{0%,62%{transform:translateX(-160px) skewX(-18deg)}88%,100%{transform:translateX(620px) skewX(-18deg)}}
    .spark{animation:tw 1.8s ease-in-out infinite}
    .live{animation:pulse 1.4s ease-in-out infinite}
    .bar{transform-box:fill-box;transform-origin:bottom;animation:grow 3.2s cubic-bezier(.3,.7,.2,1) infinite}
    @keyframes grow{0%{transform:scaleY(.05)}35%,80%{transform:scaleY(1)}100%{transform:scaleY(.05)}}
    .cut{animation:pulse 1.6s ease-in-out infinite}`;
  const thumbEl = thumb === "sisu"
    ? sisuArt(12, 12, 396, 170)
    : `<image href="${img64(thumb)}" x="12" y="12" width="396" height="170" preserveAspectRatio="xMidYMin slice"/>`;
  const body = `<defs>
      <linearGradient id="bd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R.c1}"/><stop offset=".5" stop-color="${R.c2}"/><stop offset="1" stop-color="${R.c1}"/>
        <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="6s" repeatCount="indefinite"/></linearGradient>
      <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0817" stop-opacity="0"/><stop offset="1" stop-color="#0d0817"/></linearGradient>
      <linearGradient id="holoG" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".35" stop-color="${R.c1}" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity=".28"/><stop offset=".65" stop-color="#22d3ee" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <linearGradient id="sisuBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#071433"/><stop offset="1" stop-color="#1e1b4b"/></linearGradient>
      <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset="1" stop-color="#2563eb"/></linearGradient>
      <clipPath id="card"><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="18"/></clipPath>
      <clipPath id="th"><rect x="12" y="12" width="396" height="170" rx="12"/></clipPath>
    </defs>
    <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="18" fill="#0d0817"/>
    <g clip-path="url(#th)">${thumbEl}<rect x="12" y="112" width="396" height="70" fill="url(#fade)"/></g>
    <rect x="22" y="22" width="${n(pillW)}" height="24" rx="12" fill="${R.c1}"/>
    <text x="${n(22 + pillW / 2)}" y="38.5" text-anchor="middle" font-family="${MONO}" font-size="11.5" font-weight="700" letter-spacing="2" fill="${R.text}">★ ${R.label}</text>
    <rect x="${n(398 - badgeW)}" y="22" width="${n(badgeW)}" height="24" rx="12" fill="#0b0614" fill-opacity=".85" stroke="${live ? "#22c55e" : "#6b5a8a"}"/>
    ${live ? `<circle cx="${n(398 - badgeW + 14)}" cy="34" r="4" fill="#4ade80" class="live"/>` : ""}
    <text x="${n(398 - badgeW + (live ? 26 : 11))}" y="38" font-family="${MONO}" font-size="11" font-weight="700" letter-spacing="1" fill="${live ? "#86efac" : "#c4b5fd"}">${esc(badge)}</text>
    <text x="22" y="212" font-family="${SANS}" font-size="21" font-weight="700" fill="#fff">${esc(title)}</text>
    ${desc.map((d, k) => `<text x="22" y="${236 + k * 18}" font-family="${SANS}" font-size="13" fill="#a1a1aa">${esc(d)}</text>`).join("")}
    ${chipEls}
    <g clip-path="url(#card)"><rect x="0" y="0" width="110" height="${H}" fill="url(#holoG)" class="holo"/></g>
    ${[[n(22 + pillW + 10), 26], [n(22 + pillW + 18), 40]].map(([x, y], k) => `<path d="M${x} ${y - 4}L${x + 1.1} ${y - 1.1}L${x + 4} ${y}L${x + 1.1} ${y + 1.1}L${x} ${y + 4}L${x - 1.1} ${y + 1.1}L${x - 4} ${y}L${x - 1.1} ${y - 1.1}Z" fill="${R.c1}" class="spark" style="animation-delay:${k * 0.6}s"/>`).join("")}
    <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="18" stroke="url(#bd)" stroke-width="2.5"/>`;
  write(`card-${id}.svg`, svg(W, H, body, style, title));
}

function cards() {
  [
    { id: "portfolio", title: "Portfólio RobsonDev", rarity: "epico", badge: "NO AR", live: true, thumb: "portfolio.jpg",
      desc: ["Next.js 16 com i18n PT/EN, tema claro/escuro", "e Spotify “Now Playing” em tempo real."], chips: ["Next.js 16", "React 19", "Tailwind v4", "Framer"] },
    { id: "candangos", title: "Candangos Shop", rarity: "epico", badge: "NO AR", live: true, thumb: "candangos.jpg",
      desc: ["Loja da guilda Candangos (Hytale): Pix, login", "com Discord e painel admin protegido por RLS."], chips: ["React", "Supabase", "Edge Functions", "Tailwind"] },
    { id: "sisu", title: "Simula SISU 2026", rarity: "raro", badge: "EM DEV · PRIVADO", thumb: "sisu",
      desc: ["Simulador de notas de corte do SISU em", "monorepo full stack com banco no Docker."], chips: ["Next.js", "Express", "Prisma", "PostgreSQL", "Docker"] },
    { id: "aviator", title: "Aviator Clone Pro", rarity: "raro", badge: "OPEN SOURCE", thumb: "aviator.jpg",
      desc: ["Crash game honesto em tempo real: WebSockets,", "bots multiplayer e gráfico com curvas Bézier."], chips: ["Next.js 14", "NestJS", "Socket.io", "Framer"] },
    { id: "guns", title: "Guns & Dragons", rarity: "caotico", badge: "JOGO", thumb: "guns.jpg",
      desc: ["Jogo 2D em C++ feito com IA: dragões, buraco", "negro, Modo Titan e 2.000+ linhas no main.cpp."], chips: ["C++", "SFML 3.0", "IA", "Game Dev"] },
    { id: "mindhealth", title: "Mind Health", rarity: "academico", badge: "TCC", thumb: "mindhealth.jpg",
      desc: ["Trabalho de conclusão de curso sobre", "tecnologia a serviço da saúde mental."], chips: ["TCC", "ADS · IFG", "Saúde mental"] },
  ].forEach(card);
}

/* ───────────────────────────── ARSENAL (ÓRBITA) ───────────────────────────── */
function orbit() {
  const W = 900, H = 530, CX = 450, CY = 270;
  const rand = rng(5);
  const rings = [
    { rx: 150, ry: 50, dur: 22, dir: -1, color: "#22d3ee", size: 38, label: "FRONT-END", icons: ["react", "nextjs", "ts", "js", "tailwind", "vite"] },
    { rx: 258, ry: 88, dur: 32, dir: 1, color: "#f472b6", size: 40, label: "BACK-END", icons: ["nodejs", "express", "nestjs", "prisma", "supabase", "spring", "laravel"] },
    { rx: 368, ry: 126, dur: 46, dir: -1, color: "#fde047", size: 42, label: "DADOS & INFRA", icons: ["postgres", "mysql", "mongodb", "redis", "docker", "linux", "nginx", "vercel", "git", "githubactions"] },
  ];
  const langs = [["ts", "TypeScript"], ["js", "JavaScript"], ["java", "Java"], ["c", "C"], ["cpp", "C++"], ["python", "Python"], ["lua", "Lua"]];
  const used = new Set([...rings.flatMap((r) => r.icons), ...langs.map((l) => l[0])]);
  const defs = [...used].map((i) => `<image id="i-${i}" x="-.5" y="-.5" width="1" height="1" href="${icon64(i)}"/>`).join("");

  const STEPS = 48;
  let back = "", front = "";
  for (const r of rings) {
    // dir 1: θ cresce (sentido horário na tela); dir -1: decresce
    const path = `M${CX + r.rx} ${CY}A${r.rx} ${r.ry} 0 1 1 ${CX - r.rx} ${CY}A${r.rx} ${r.ry} 0 1 1 ${CX + r.rx} ${CY}`;
    const scales = [], times = [];
    for (let k = 0; k <= STEPS; k++) {
      const p = k / STEPS;
      const th = 2 * Math.PI * (r.dir === 1 ? p : 1 - p);
      scales.push(n(0.7 + 0.3 * ((Math.sin(th) + 1) / 2)));
      times.push((k / STEPS).toFixed(4));
    }
    const kp = r.dir === 1 ? "0;1" : "1;0";
    // metade de trás (sinθ < 0) = primeira ou segunda metade do ciclo
    const backVis = r.dir === 1 ? "0;1" : "1;0", frontVis = r.dir === 1 ? "1;0" : "0;1";
    r.icons.forEach((ic, j) => {
      const begin = n(-(j / r.icons.length) * r.dur);
      const copy = (vis, op) => `<g><animateMotion path="${path}" dur="${r.dur}s" begin="${begin}s" repeatCount="indefinite" keyPoints="${kp}" keyTimes="0;1" calcMode="linear"/>
        <g><animateTransform attributeName="transform" type="scale" values="${scales.join(";")}" keyTimes="${times.join(";")}" dur="${r.dur}s" begin="${begin}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" calcMode="discrete" values="${vis}" keyTimes="0;.5" dur="${r.dur}s" begin="${begin}s" repeatCount="indefinite"/>
        <use href="#i-${ic}" transform="scale(${r.size})" opacity="${op}"/></g></g>`;
      back += copy(backVis, 0.6);
      front += copy(frontVis, 1);
    });
  }

  const ellipses = rings.map((r, i) => `<ellipse cx="${CX}" cy="${CY}" rx="${r.rx}" ry="${r.ry}" stroke="${r.color}" stroke-opacity=".28" stroke-width="1.2" stroke-dasharray="3 7" class="flow" style="animation-duration:${8 + i * 4}s"/>`).join("");
  const frontArcs = rings.map((r) => `<path d="M${CX - r.rx} ${CY}A${r.rx} ${r.ry} 0 0 0 ${CX + r.rx} ${CY}" stroke="${r.color}" stroke-opacity=".55" stroke-width="1.6" filter="url(#g2)"/>`).join("");

  const LSTEP = 1.6, LT = LSTEP * langs.length, lp = (s) => n((s / LT) * 100);
  const core = `<circle cx="${CX}" cy="${CY}" r="96" fill="url(#halo)" class="halo"/>
    <circle cx="${CX}" cy="${CY}" r="64" fill="url(#coreG)" stroke="#c084fc" stroke-width="1.5"/>
    <circle cx="${CX}" cy="${CY}" r="73" stroke="#c084fc" stroke-opacity=".7" stroke-width="1.5" stroke-dasharray="4 10" class="spinA"/>
    <circle cx="${CX}" cy="${CY}" r="81" stroke="#22d3ee" stroke-opacity=".45" stroke-width="1" stroke-dasharray="40 18 6 18" class="spinB"/>
    <text x="${CX}" y="${CY - 34}" text-anchor="middle" font-family="${MONO}" font-size="8.5" letter-spacing="2.5" fill="#e9d5ff" opacity=".8">LINGUAGENS</text>
    ${langs.map(([ic, name], i) => `<g class="lang" style="animation-delay:${n(i * LSTEP)}s"><use href="#i-${ic}" transform="translate(${CX} ${CY - 4}) scale(40)"/><text x="${CX}" y="${CY + 34}" text-anchor="middle" font-family="${MONO}" font-size="12" font-weight="700" fill="#fff">${name}</text></g>`).join("")}`;

  const legend = rings.map((r, i) => {
    const x = 210 + i * 180;
    return `<circle cx="${x}" cy="${H - 30}" r="5" fill="${r.color}" filter="url(#g2)"/><text x="${x + 13}" y="${H - 25.5}" font-family="${MONO}" font-size="12" font-weight="700" letter-spacing="2" fill="#e4e4e7">${esc(r.label)}</text>`;
  }).join("");

  const style = `${BASE_STYLE}
    .flow{animation:flow 10s linear infinite}@keyframes flow{to{stroke-dashoffset:-100}}
    .spinA{transform-box:fill-box;transform-origin:center;animation:spin 14s linear infinite}
    .spinB{transform-box:fill-box;transform-origin:center;animation:spin 20s linear infinite reverse}
    @keyframes spin{to{transform:rotate(360deg)}}
    .halo{animation:pulse 3.4s ease-in-out infinite}
    .lang{opacity:0;animation:lang ${LT}s infinite both}
    @keyframes lang{0%{opacity:0}${lp(0.2)}%,${lp(LSTEP - 0.2)}%{opacity:1}${lp(LSTEP)}%,100%{opacity:0}}`;

  const body = `<defs>${defs}
      <clipPath id="panel"><rect width="${W}" height="${H}" rx="20"/></clipPath>
      <radialGradient id="bg" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#1c0838"/><stop offset="1" stop-color="#05020b"/></radialGradient>
      <radialGradient id="neb1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#db2777" stop-opacity=".22"/><stop offset="1" stop-color="#db2777" stop-opacity="0"/></radialGradient>
      <radialGradient id="neb2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0891b2" stop-opacity=".2"/><stop offset="1" stop-color="#0891b2" stop-opacity="0"/></radialGradient>
      <radialGradient id="coreG" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#a855f7"/><stop offset=".55" stop-color="#4c1d95"/><stop offset="1" stop-color="#14052a"/></radialGradient>
      <radialGradient id="halo"><stop offset=".55" stop-color="#a855f7" stop-opacity=".45"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/></radialGradient>
      ${GLOW("g2", 2.5)}
    </defs>
    <g clip-path="url(#panel)">
      <rect width="${W}" height="${H}" fill="url(#bg)"/>
      <ellipse cx="190" cy="140" rx="260" ry="160" fill="url(#neb1)"/>
      <ellipse cx="720" cy="380" rx="280" ry="170" fill="url(#neb2)"/>
      ${stars(rand, 110, W, H)}
      ${ellipses}
      ${back}
      ${core}
      ${frontArcs}
      ${front}
      ${legend}
    </g>
    <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="19.5" stroke="#7f2ccb" stroke-opacity=".6" stroke-width="1.5"/>`;
  write("stack-orbit.svg", svg(W, H, body, style, "Stack: React, Next.js, TypeScript, Node.js, NestJS, Prisma, Supabase, PostgreSQL, Docker e mais"));
}

/* ───────────────────────────── CONTATO (BOTÕES DE FLIPERAMA) ───────────────────────────── */
function arcade() {
  const list = [
    ["linkedin", "LINKEDIN", "/in/robson-rodrigues-dev", "#3b82f6", "#1e40af", "#bfdbfe", "P1"],
    ["discord", "DISCORD", "chama no privado", "#8b5cf6", "#4c1d95", "#ddd6fe", "P2"],
    ["portfolio", "PORTFÓLIO", "site ao vivo", "#ec4899", "#9d174d", "#fbcfe8", "P3"],
  ];
  list.forEach(([id, label, sub, c, dark, light, p], i) => {
    const W = 220, H = 210, CX = 110;
    const iconName = id === "portfolio" ? "vercel" : id;
    const style = `${BASE_STYLE}
      .top{animation:press 3.6s infinite;animation-delay:${i * 1.2}s}
      @keyframes press{0%,8%,18%,100%{transform:translateY(0)}11%,14%{transform:translateY(9px)}}
      .side{transform-box:fill-box;transform-origin:bottom;animation:side 3.6s infinite;animation-delay:${i * 1.2}s}
      @keyframes side{0%,8%,18%,100%{transform:scaleY(1)}11%,14%{transform:scaleY(.25)}}
      .flash{opacity:0;animation:flash 3.6s infinite;animation-delay:${i * 1.2}s}
      @keyframes flash{0%,9%,30%,100%{opacity:0}12%{opacity:1}}
      .tag{animation:pulse 2s ease-in-out infinite}`;
    const body = `<defs>
        <radialGradient id="dome" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${dark}"/></radialGradient>
        <radialGradient id="fl"><stop offset=".4" stop-color="${c}" stop-opacity=".9"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#140a24"/><stop offset="1" stop-color="#07030d"/></linearGradient>
        ${GLOW("g", 3)}
      </defs>
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="url(#bg)" stroke="#2c1450" stroke-width="1.5"/>
      <rect x="14" y="14" width="34" height="20" rx="10" fill="${c}" class="tag"/><text x="31" y="28" text-anchor="middle" font-family="${MONO}" font-size="11" font-weight="700" fill="#fff">${p}</text>
      <use href="#ic" transform="translate(${W - 31} 24) scale(26)"/>
      <ellipse cx="${CX}" cy="122" rx="86" ry="34" fill="url(#fl)" class="flash"/>
      <ellipse cx="${CX}" cy="122" rx="74" ry="28" fill="#1a1a22" stroke="#3a3a48" stroke-width="2"/>
      <ellipse cx="${CX}" cy="119" rx="62" ry="22" fill="#050507"/>
      <rect x="${CX - 50}" y="100" width="100" height="18" fill="${dark}" class="side"/>
      <g class="top">
        <ellipse cx="${CX}" cy="100" rx="50" ry="19" fill="url(#dome)"/>
        <ellipse cx="${CX - 14}" cy="92" rx="20" ry="6" fill="#fff" opacity=".35"/>
      </g>
      <text x="${CX}" y="174" text-anchor="middle" font-family="${MONO}" font-size="15" font-weight="700" letter-spacing="3" fill="#fff" filter="url(#g)">${esc(label)}</text>
      <text x="${CX}" y="193" text-anchor="middle" font-family="${MONO}" font-size="10.5" fill="#a1a1aa">${esc(sub)}</text>`;
    const withIcon = body.replace("<defs>", `<defs><image id="ic" x="-.5" y="-.5" width="1" height="1" href="${icon64(iconName)}"/>`);
    write(`btn-${id}.svg`, svg(W, H, withIcon, style, label));
  });
}

/* ───────────────────────────── RODAPÉ ───────────────────────────── */
function footer() {
  const W = 900, H = 250, HZ = 168, CX = 450;
  const rand = rng(99);
  const g = grid({ id: "f", w: W, top: HZ, bottom: H, vx: CX, spacing: 60, lines: 7, dur: 3 });
  const T = 14;
  const pc = (s) => n((s / T) * 100);
  const digits = Array.from({ length: 10 }, (_, i) => 9 - i);
  const style = `${BASE_STYLE}${g.style}
    .dg{opacity:0;animation:dg ${T}s infinite both}
    @keyframes dg{0%{opacity:0;transform:scale(1.4)}${pc(0.08)}%{opacity:1;transform:scale(1)}${pc(0.9)}%{opacity:1}${pc(1)}%,100%{opacity:0}}
    .dg{transform-box:fill-box;transform-origin:center}
    .cont{animation:cont ${T}s infinite both}
    @keyframes cont{0%,${pc(10)}%{opacity:1}${pc(10.2)}%,100%{opacity:0}}
    .thx{opacity:0;animation:thx ${T}s infinite both;transform-box:fill-box;transform-origin:center}
    @keyframes thx{0%,${pc(10)}%{opacity:0;transform:scale(.6)}${pc(10.6)}%,${pc(13.6)}%{opacity:1;transform:scale(1)}100%{opacity:0}}
    .coin{animation:blink 1s steps(1) infinite}`;
  const body = `<defs>
      <clipPath id="frame"><rect width="${W}" height="${H}" rx="20"/></clipPath>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05010c"/><stop offset=".62" stop-color="#2a0845"/><stop offset=".67" stop-color="#08010f"/></linearGradient>
      <pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity=".25"/></pattern>
      ${GLOW("glow", 3)}${GLOW("glowBig", 8)}
    </defs>
    <g clip-path="url(#frame)">
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      ${stars(rand, 60, W, HZ - 10)}
      ${g.body}
      <line x1="0" x2="${W}" y1="${HZ}" y2="${HZ}" stroke="#f0abfc" stroke-width="2" filter="url(#glow)"/>
      <g class="cont">
        <text x="${CX - 40}" y="96" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="40" letter-spacing="4" fill="#ff2e97" filter="url(#glowBig)">CONTINUE?</text>
      </g>
      ${digits.map((d, i) => `<text x="${CX + 150}" y="102" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="58" fill="#fde047" filter="url(#glow)" class="dg" style="animation-delay:${i}s">${d}</text>`).join("")}
      <text x="${CX}" y="98" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="34" letter-spacing="3" fill="#67e8f9" filter="url(#glowBig)" class="thx">OBRIGADO POR JOGAR!</text>
      <text x="${CX}" y="140" text-anchor="middle" font-family="${MONO}" font-size="13" font-weight="700" letter-spacing="6" fill="#fde047" class="coin">INSERT COIN</text>
      <text x="${CX}" y="236" text-anchor="middle" font-family="${MONO}" font-size="10.5" letter-spacing="3" fill="#f5d0fe" opacity=".85">© 2026 ROBSON RODRIGUES · FEITO COM CÓDIGO E CAFÉ</text>
      <rect width="${W}" height="${H}" fill="url(#scan)"/>
    </g>
    <rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="19.5" stroke="#7f2ccb" stroke-opacity=".6" stroke-width="1.5"/>`;
  write("footer.svg", svg(W, H, body, style, "Obrigado por jogar!"));
}

hero();
navButtons();
titles();
terminal();
achievements();
featured();
cards();
orbit();
arcade();
footer();
