// Gera os SVGs do README em ../assets, no mesmo tema do portfólio
// (preto arroxeado, texto lilás claro e violeta da ilustração).
// uso: node generator/gen.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "src");
const OUT = join(HERE, "..", "assets");
mkdirSync(OUT, { recursive: true });

// Cores do src/app/globals.css do portfólio
const C = {
  bg: "#0a0710",
  surface: "#120d1c",
  surface2: "#1a1328",
  ink: "#f2eefa",
  muted: "#a097b4",
  line: "rgba(255,255,255,0.08)",
  lineStrong: "rgba(255,255,255,0.15)",
  accent: "#a879ff",
  v1: "#b57cff",
  v2: "#7a2bf0",
};

const SANS = "G, 'Segoe UI', system-ui, -apple-system, sans-serif";
const MONO = "GM, ui-monospace, 'Cascadia Code', Consolas, monospace";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const b64 = (f, mime) => `data:${mime};base64,${readFileSync(join(SRC, f)).toString("base64")}`;
const webp = (f) => b64(f, "image/webp");
const n = (v) => Math.round(v * 100) / 100;

function webpSize(f) {
  const b = readFileSync(join(SRC, f));
  const t = b.toString("latin1", 12, 16);
  if (t === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (t === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  const v = b.readUInt32LE(21);
  return [(v & 0x3fff) + 1, ((v >> 14) & 0x3fff) + 1];
}

// Geist e Geist Mono embutidas (OFL), só nos SVGs que usam cada uma.
const FONT = {
  sans: `@font-face{font-family:G;font-weight:100 900;src:url(${b64("fonts/geist.woff2", "font/woff2")}) format("woff2")}`,
  mono: `@font-face{font-family:GM;font-weight:100 900;src:url(${b64("fonts/geist-mono.woff2", "font/woff2")}) format("woff2")}`,
};

const BASE_CSS = `
  .s{font-family:${SANS}}
  .m{font-family:${MONO}}
  @media (prefers-reduced-motion: reduce){*{animation:none!important}}
`;

const svg = (w, h, body, { title = "", css = "", mono = true } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">` +
  (title ? `<title>${esc(title)}</title>` : "") +
  `<style>${FONT.sans}${mono ? FONT.mono : ""}${(BASE_CSS + css).replace(/\s*\n\s*/g, "")}</style>` +
  body +
  `</svg>`;

function write(name, content) {
  writeFileSync(join(OUT, name), content);
  console.log(`${name.padEnd(26)} ${(Buffer.byteLength(content) / 1024).toFixed(1)} KB`);
}

// Largura aproximada de texto em Geist, para quebrar linhas sem medir de verdade.
function textWidth(s, size) {
  let w = 0;
  for (const ch of s) {
    if (" ilj.,:;'|!".includes(ch)) w += 0.27;
    else if ("ftr()[]".includes(ch)) w += 0.36;
    else if ("mwMW".includes(ch)) w += 0.82;
    else if (ch >= "A" && ch <= "Z") w += 0.66;
    else w += 0.55;
  }
  return w * size;
}

function wrap(text, max, size) {
  const lines = [];
  let cur = "";
  for (const word of text.split(" ")) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && textWidth(next, size) > max) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

const lines = (arr, x, y, lh, attrs) =>
  arr.map((l, i) => `<text x="${x}" y="${n(y + i * lh)}" ${attrs}>${esc(l)}</text>`).join("");

// Monograma RR, igual ao src/components/Logo.tsx
function logo(id, x, y, size) {
  const k = size / 64;
  return (
    `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.v1}"/><stop offset="1" stop-color="${C.v2}"/></linearGradient>` +
    `<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>` +
    `<g transform="translate(${x} ${y}) scale(${n(k)})"><rect width="64" height="64" rx="17" fill="url(#${id}g)"/><rect width="64" height="64" rx="17" fill="url(#${id}h)"/>` +
    `<g fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 46V19h9.5a7.5 7.5 0 0 1 0 15H15M23.5 34 31 46"/><path d="M31 46V19h9.5a7.5 7.5 0 0 1 0 15H31M39.5 34 47 46"/></g></g>`
  );
}

// Degradês de título: .title-grad e o violeta do hero
const GRADS = `
  <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9bce6"/></linearGradient>
  <linearGradient id="vg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d9c2ff"/><stop offset=".45" stop-color="${C.v1}"/><stop offset="1" stop-color="#8f4dff"/></linearGradient>
  <radialGradient id="au1"><stop offset="0" stop-color="rgb(122,43,240)" stop-opacity=".35"/><stop offset="1" stop-color="rgb(122,43,240)" stop-opacity="0"/></radialGradient>
  <radialGradient id="au2"><stop offset="0" stop-color="rgb(181,124,255)" stop-opacity=".22"/><stop offset="1" stop-color="rgb(181,124,255)" stop-opacity="0"/></radialGradient>
`;

const AURORA_CSS = `
  .au{animation:au 18s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
  .au2{animation-delay:-9s}
  @keyframes au{0%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,30px) scale(1.08)}100%{transform:translate(-30px,10px) scale(.96)}}
`;

const ARROW_UR = (x, y, s = 1, color = C.ink) =>
  `<g transform="translate(${x} ${y}) scale(${s})" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 11 11 1M3.5 1H11v7.5"/></g>`;

// ───────────────────────────── Hero ─────────────────────────────
function hero() {
  const W = 1200, H = 640;
  const [aw, ah] = webpSize("avatar-560.webp");
  const avW = 410, avH = n((avW * ah) / aw);
  const card = { x: 720, y: 130, w: 420, h: 440 };
  const avY = card.y + card.h - avH;

  const code = [
    [["k", "const "], ["v", "robson"], ["p", " = {"]],
    [["p", "  role: "], ["s", '"front-end"'], ["p", ","]],
    [["p", "  base: "], ["s", '"Brasília, BR"'], ["p", ","]],
    [["p", "  langs: "], ["s", '["EN", "PT"]'], ["p", ","]],
    [["p", "  status: "], ["s", '"available"'], ["p", ","]],
    [["p", "};"]],
  ];
  const term = { x: 580, y: 420, w: 360, h: 200 };
  const T = 9; // ciclo da digitação, em segundos
  let codeSvg = "";
  code.forEach((parts, i) => {
    const y = term.y + 74 + i * 22;
    const text = parts.map(([k, t]) => `<tspan class="c${k}">${esc(t)}</tspan>`).join("");
    const len = parts.reduce((a, [, t]) => a + t.length, 0);
    const w = len * 8.4 + 4;
    const s = (0.4 + i * 0.75) / T, e = Math.min((0.4 + i * 0.75 + len * 0.035) / T, 0.95);
    codeSvg +=
      `<clipPath id="cl${i}"><rect x="${term.x + 20}" y="${y - 15}" height="20" width="0"><animate attributeName="width" values="0;0;${n(w)};${n(w)};0" keyTimes="0;${n(s)};${n(e)};0.96;1" dur="${T}s" repeatCount="indefinite"/></rect></clipPath>` +
      `<text x="${term.x + 20}" y="${y}" class="m" font-size="14" xml:space="preserve" clip-path="url(#cl${i})">${text}</text>`;
  });

  const body = `
  <defs>${GRADS}
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.v1}"/><stop offset="1" stop-color="${C.v2}"/></linearGradient>
    <linearGradient id="cardHi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.bg}" stop-opacity="0"/><stop offset="1" stop-color="${C.bg}" stop-opacity=".55"/></linearGradient>
    <radialGradient id="glow"><stop offset="0" stop-color="${C.v2}" stop-opacity=".55"/><stop offset="1" stop-color="${C.v2}" stop-opacity="0"/></radialGradient>
    <clipPath id="avClip"><path d="M${card.x - 40} 0H${W}V${card.y + card.h - 32}a32 32 0 0 1-32 32H${card.x + 32}a32 32 0 0 1-32-32V${card.y + 40}H${card.x - 40}Z"/></clipPath>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".55"/></filter>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <circle class="au" cx="160" cy="40" r="360" fill="url(#au1)"/>
    <circle class="au au2" cx="1040" cy="200" r="320" fill="url(#au2)"/>

    <!-- barra de navegação -->
    <rect x="24" y="22" width="${W - 48}" height="64" rx="20" fill="rgba(18,13,28,0.6)" stroke="${C.line}"/>
    ${logo("lg", 40, 36, 36)}
    <text x="88" y="61" class="s" font-size="18" font-weight="600" fill="${C.ink}" letter-spacing="-0.2">Robson Rodrigues</text>
    <rect x="${W - 268}" y="36" width="228" height="36" rx="18" fill="${C.surface2}" stroke="${C.line}"/>
    <circle cx="${W - 246}" cy="54" r="5" fill="#4ade80"/>
    <circle class="pulse" cx="${W - 246}" cy="54" r="5" fill="#4ade80"/>
    <text x="${W - 232}" y="59.5" class="s" font-size="15" font-weight="500" fill="${C.ink}">Available for new projects</text>

    <!-- título -->
    <g class="s" font-size="72" font-weight="600" letter-spacing="-3.2">
      <text x="48" y="232" fill="url(#tg)">Websites and</text>
      <text x="48" y="308"><tspan fill="url(#tg)">products </tspan><tspan fill="url(#vg)">that</tspan></text>
      <text x="48" y="384" fill="url(#vg)">sell for you.</text>
    </g>
    ${lines(
      ["I'm Robson Rodrigues, a front-end developer", "from Brazil. I build fast, accessible,", "great-looking interfaces for clients", "around the world."],
      50, 444, 31, `class="s" font-size="21" fill="${C.muted}"`,
    )}

    <!-- palco do avatar -->
    <circle cx="${card.x + card.w / 2}" cy="${card.y + card.h / 2}" r="330" fill="url(#glow)"/>
    <rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" rx="32" fill="url(#card)"/>
    <rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" rx="32" fill="url(#cardHi)"/>
    <text x="${card.x + card.w / 2}" y="${card.y + 120}" text-anchor="middle" class="s" font-size="118" font-weight="800" letter-spacing="-6" fill="#fff" fill-opacity=".16">&lt;/&gt;</text>
    <g clip-path="url(#avClip)">
      <image href="${webp("avatar-560.webp")}" x="${card.x + 10}" y="${n(avY)}" width="${avW}" height="${avH}"/>
      <rect x="${card.x}" y="${card.y + card.h - 140}" width="${card.w}" height="140" fill="url(#fade)"/>
    </g>

    <!-- selo "Coding..." -->
    <g transform="translate(${card.x + card.w - 64} ${card.y + 104})">
      <rect width="128" height="38" rx="19" fill="rgba(10,7,16,0.85)" stroke="${C.lineStrong}"/>
      <rect class="bar b1" x="16" y="13" width="3" height="14" rx="1.5" fill="${C.accent}"/>
      <rect class="bar b2" x="22" y="13" width="3" height="14" rx="1.5" fill="${C.accent}"/>
      <rect class="bar b3" x="28" y="13" width="3" height="14" rx="1.5" fill="${C.accent}"/>
      <text x="40" y="24.5" class="s" font-size="14" font-weight="600" fill="${C.ink}">Coding...</text>
    </g>

    <!-- terminal -->
    <g filter="url(#sh)">
      <rect x="${term.x}" y="${term.y}" width="${term.w}" height="${term.h}" rx="16" fill="#151020" fill-opacity=".96" stroke="${C.lineStrong}"/>
    </g>
    <line x1="${term.x}" x2="${term.x + term.w}" y1="${term.y + 40}" y2="${term.y + 40}" stroke="${C.line}"/>
    <circle cx="${term.x + 20}" cy="${term.y + 20}" r="5.5" fill="#ff5f57"/>
    <circle cx="${term.x + 38}" cy="${term.y + 20}" r="5.5" fill="#febc2e"/>
    <circle cx="${term.x + 56}" cy="${term.y + 20}" r="5.5" fill="#28c840"/>
    <text x="${term.x + 76}" y="${term.y + 25}" class="m" font-size="13" fill="${C.muted}">robson.ts</text>
    ${codeSvg}
  </g>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="27.5" stroke="${C.line}"/>`;

  const css = `
    ${AURORA_CSS}
    .ck{fill:${C.accent}} .cv{fill:${C.ink}} .cp{fill:${C.muted}} .cs{fill:#e5c3ff}
    .pulse{animation:pulse 2s ease-out infinite;transform-box:fill-box;transform-origin:center}
    @keyframes pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}
    .bar{animation:bar 1s ease-in-out infinite;transform-box:fill-box;transform-origin:bottom}
    .b2{animation-delay:-.33s} .b3{animation-delay:-.66s}
    @keyframes bar{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
  `;
  write("hero.svg", svg(W, H, body, { title: "Robson Rodrigues — Websites and products that sell for you.", css }));
}

// ───────────────────────────── Botões ─────────────────────────────
function button(name, label, { primary = false } = {}) {
  const H = 56, fs = 18;
  const w = Math.round(textWidth(label, fs) * 1.08 + 76);
  const fg = primary ? C.bg : C.ink;
  const ic = ARROW_UR(w - 36, 22, 1, fg);
  const body = `
    <defs><linearGradient id="bh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e4dcf5"/></linearGradient></defs>
    <rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="${(H - 2) / 2}" fill="${primary ? "url(#bh)" : C.surface}" stroke="${primary ? "#cbbcf0" : C.lineStrong}"/>
    <text x="24" y="34.5" class="s" font-size="${fs}" font-weight="600" fill="${fg}">${esc(label)}</text>
    ${ic}`;
  write(`btn-${name}.svg`, svg(w, H, body, { title: label, mono: false }));
}

// ───────────────────────────── Títulos de seção ─────────────────────────────
function sectionTitle(name, num, label, title, text) {
  const W = 1200;
  // Fundo escuro próprio para não sumir no tema claro do GitHub.
  const t = text ? wrap(text, 1000, 21) : [];
  const H = 172 + t.length * 31 + (t.length ? 14 : 0);
  const body = `
    <defs>${GRADS}<clipPath id="f"><rect width="${W}" height="${H}" rx="24"/></clipPath></defs>
    <g clip-path="url(#f)">
      <rect width="${W}" height="${H}" fill="${C.bg}"/>
      <circle cx="${W - 60}" cy="0" r="260" fill="url(#au1)"/>
      <text x="42" y="62" class="m" font-size="15" fill="${C.accent}" letter-spacing="1.5">${num}</text>
      <line x1="76" x2="116" y1="57" y2="57" stroke="${C.accent}" stroke-opacity=".5"/>
      <text x="128" y="62" class="m" font-size="15" fill="${C.muted}" letter-spacing="1.5">${esc(label.toUpperCase())}</text>
      <text x="40" y="128" class="s" font-size="52" font-weight="600" letter-spacing="-2" fill="url(#tg)">${esc(title)}</text>
      ${lines(t, 42, 172, 31, `class="s" font-size="21" fill="${C.muted}"`)}
    </g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="23.5" stroke="${C.line}"/>`;
  write(`title-${name}.svg`, svg(W, H, body, { title }));
}

// ───────────────────────────── Projetos ─────────────────────────────
const PROJECTS = [
  { id: "simula-sisu", title: "Simula Sisu", kind: "Product", year: "2026", status: "Visit site", stack: ["Next.js", "Express", "Prisma", "PostgreSQL"],
    summary: "A simulator for Brazil's university admissions, using each school's official weights, with side-by-side course comparison and an AI assistant." },
  { id: "gabriela", title: "Gabriela Decorações", kind: "Client", year: "2025", status: "Visit site", stack: ["React", "TypeScript", "Vite", "Tailwind"],
    summary: "Landing page for a curtain and blinds company with 18 years in business, built to drive quote requests on WhatsApp." },
  { id: "shine", title: "Shinê Editor", kind: "Client", year: "2026", status: "Visit site", stack: ["React 19", "Vite", "CSS", "i18n"],
    summary: "Portfolio for a YouTube video editor, in three languages, scoring 100 on PageSpeed for both mobile and desktop." },
  { id: "clinica", title: "Clínica Araújo", kind: "Client", year: "2026", status: "Launching soon", stack: ["React", "Vite", "Tailwind", "Framer Motion"],
    summary: "Website for a dental clinic: treatments, the doctors, a kids' corner and WhatsApp booking. Lighthouse 100 on desktop." },
  { id: "rdl", title: "RDL Development", kind: "Client", year: "2026", status: "Visit site", stack: ["Next.js 16", "Tailwind 4"],
    summary: "Website for our dev studio, animated with nothing but CSS and the Web Animations API." },
  { id: "candangos", title: "Candangos Shop", kind: "Product", year: "2025", status: "Visit site", stack: ["React", "Supabase", "Edge Functions", "Pix"],
    summary: "A full online store for a Hytale gaming guild, focused on a smooth checkout with Pix payments." },
  { id: "mind-health", title: "Mind Health", kind: "Side project", year: "2025", status: "View code", stack: ["React", "Node.js", "RBAC"],
    summary: "Mental health platform and my college capstone. I built the React front-end from Jul 2024 to Dec 2025." },
  { id: "aviator", title: "Aviator Clone Pro", kind: "Side project", year: "2024", status: "View code", stack: ["React 19", "JavaScript"],
    summary: "A real-time game simulator running at 60 FPS, with a custom multiplier engine." },
];

function projectCard(p) {
  const W = 600, H = 590, pad = 16;
  const iw = W - pad * 2, ih = n((iw * 750) / 1200);
  const sum = wrap(p.summary, W - pad * 2 - 8, 19).slice(0, 3);
  const soon = p.status === "Launching soon";
  const chipW = Math.round(textWidth(p.status, 14) + (soon ? 28 : 46));
  const ty = pad + ih + 52;
  const body = `
    <defs>
      <clipPath id="ic"><rect x="${pad}" y="${pad}" width="${iw}" height="${ih}" rx="14"/></clipPath>
      <linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset=".6" stop-color="${C.bg}" stop-opacity="0"/><stop offset="1" stop-color="${C.bg}" stop-opacity=".35"/></linearGradient>
    </defs>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="${C.surface}" stroke="${C.line}"/>
    <g clip-path="url(#ic)">
      <image href="${webp(`work/${p.id}-1200.webp`)}" x="${pad}" y="${pad}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMin slice"/>
      <rect x="${pad}" y="${pad}" width="${iw}" height="${ih}" fill="url(#sh)"/>
    </g>
    <rect x="${pad + 0.5}" y="${pad + 0.5}" width="${iw - 1}" height="${ih - 1}" rx="13.5" stroke="${C.line}"/>
    <text x="${pad + 4}" y="${ty}" class="s" font-size="27" font-weight="600" letter-spacing="-0.8" fill="${C.ink}">${esc(p.title)}</text>
    <g transform="translate(${W - pad - chipW} ${ty - 25})">
      <rect width="${chipW}" height="34" rx="17" fill="${soon ? "rgba(168,121,255,0.14)" : C.surface2}" stroke="${soon ? "rgba(168,121,255,0.4)" : C.line}"/>
      <text x="14" y="22" class="s" font-size="14" font-weight="600" fill="${soon ? C.accent : C.ink}">${esc(p.status)}</text>
      ${soon ? "" : ARROW_UR(chipW - 28, 12, 0.85, C.accent)}
    </g>
    ${lines(sum, pad + 4, ty + 38, 28, `class="s" font-size="19" fill="${C.muted}"`)}
    <line x1="${pad + 4}" x2="${W - pad - 4}" y1="${H - 52}" y2="${H - 52}" stroke="${C.line}"/>
    <text x="${pad + 4}" y="${H - 22}" class="m" font-size="14" fill="${C.muted}">${esc(p.stack.join(" / "))}</text>
    <text x="${W - pad - 4}" y="${H - 22}" text-anchor="end" class="m" font-size="14" fill="${C.muted}">${esc(`${p.kind}, ${p.year}`)}</text>`;
  write(`card-${p.id}.svg`, svg(W, H, body, { title: `${p.title} — ${p.summary}` }));
}

// ───────────────────────────── Candidarte (destaque) ─────────────────────────────
function candidarte() {
  const W = 1200, H = 760;
  const [pw, ph] = webpSize("candidarte-poster.webp");
  const px = 32, py = 32, pW = 640, pH = n((pW * ph) / pw);
  const rx = px + pW + 40, rw = W - rx - 40;
  const text = wrap("A dashboard that keeps your job hunt organized. Paste a job link and AI tells you how well your résumé matches it.", rw, 20);
  const feats = [
    ["Browser extension", "Spots when you apply on LinkedIn or Gupy and saves the job in one click."],
    ["Résumé tuned per job", "Suggests the keywords applicant tracking systems scan for, without making anything up."],
    ["Daily watch", "Checks every day whether the job is still open and emails you when something changes."],
    ["Your numbers", "Your funnel, response rate and time to first reply, all in one place."],
  ];
  const fy = py + pH + 32, fw = (W - 64 - 3 * 16) / 4, fh = H - fy - 76;
  const featSvg = feats.map(([t, d], i) => {
    const x = 32 + i * (fw + 16);
    return `<rect x="${n(x)}" y="${fy}" width="${n(fw)}" height="${n(fh)}" rx="18" fill="${C.surface2}" stroke="${C.line}"/>
      <text x="${n(x + 22)}" y="${fy + 38}" class="m" font-size="14" fill="${C.accent}">0${i + 1}</text>
      <text x="${n(x + 22)}" y="${fy + 74}" class="s" font-size="20" font-weight="600" fill="${C.ink}">${esc(t)}</text>
      ${lines(wrap(d, fw - 44, 16.5), n(x + 22), fy + 104, 24, `class="s" font-size="16.5" fill="${C.muted}"`)}`;
  }).join("");
  const body = `
    <defs>${GRADS}
      <clipPath id="pc"><rect x="${px}" y="${py}" width="${pW}" height="${pH}" rx="18"/></clipPath>
      <clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>
    </defs>
    <g clip-path="url(#frame)">
      <rect width="${W}" height="${H}" fill="${C.surface}"/>
      <circle class="au" cx="${W - 120}" cy="80" r="300" fill="url(#au1)"/>
      <g clip-path="url(#pc)"><image href="${webp("candidarte-poster.webp")}" x="${px}" y="${py}" width="${pW}" height="${pH}"/></g>
      <rect x="${px + 0.5}" y="${py + 0.5}" width="${pW - 1}" height="${pH - 1}" rx="17.5" stroke="${C.lineStrong}"/>
      <!-- botão de play decorativo, como no vídeo do site -->
      <circle cx="${px + pW / 2}" cy="${py + pH / 2}" r="34" fill="rgba(10,7,16,0.7)" stroke="rgba(255,255,255,0.3)"/>
      <path d="M${px + pW / 2 - 9} ${py + pH / 2 - 14}v28l23-14Z" fill="#fff"/>

      <rect x="${rx}" y="${py + 8}" width="126" height="32" rx="16" fill="rgba(168,121,255,0.14)" stroke="rgba(168,121,255,0.4)"/>
      <circle class="pulse" cx="${rx + 18}" cy="${py + 24}" r="4" fill="${C.accent}"/>
      <circle cx="${rx + 18}" cy="${py + 24}" r="4" fill="${C.accent}"/>
      <text x="${rx + 30}" y="${py + 29}" class="s" font-size="14" font-weight="600" fill="${C.accent}">Coming soon</text>
      <text x="${rx}" y="${py + 98}" class="s" font-size="46" font-weight="600" letter-spacing="-1.8" fill="url(#tg)">Candidarte</text>
      ${lines(wrap("The product I'm building right now.", rw, 22), rx, py + 142, 30, `class="s" font-size="22" font-weight="500" fill="${C.ink}"`)}
      ${lines(text, rx, py + 186, 30, `class="s" font-size="20" fill="${C.muted}"`)}
      <text x="${rx}" y="${py + pH - 6}" class="m" font-size="14" fill="${C.muted}">A product by RDL Development</text>
      ${featSvg}
      <text x="32" y="${H - 34}" class="m" font-size="15" fill="${C.muted}"><tspan fill="${C.accent}">✓ </tspan>70 unit tests and 50 end-to-end tests running in CI · Next.js 16 · Fastify · PostgreSQL · Gemini</text>
    </g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="27.5" stroke="${C.line}"/>`;
  const css = `${AURORA_CSS}
    .pulse{animation:pulse 2s ease-out infinite;transform-box:fill-box;transform-origin:center}
    @keyframes pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(3);opacity:0}}`;
  write("candidarte.svg", svg(W, H, body, { title: "Candidarte — an AI-powered job application tracker. Coming soon.", css }));
}

// ───────────────────────────── Serviços ─────────────────────────────
function services() {
  const items = [
    ["Landing pages and websites", "Pages that load fast, rank on Google and turn visitors into leads."],
    ["Web products", "Dashboards, SaaS and custom tools, from prototype to production, built with React, Next.js and Node."],
    ["Performance and SEO", "Core Web Vitals audits and fixes. My latest site scores 100 on PageSpeed."],
    ["Interfaces with motion", "Motion that guides the eye and adds personality, without slowing the page down or ignoring people who prefer less motion."],
  ];
  // ícones simples no traço do Phosphor
  const icons = [
    `<rect x="2" y="4" width="24" height="18" rx="3"/><path d="M2 9h24M6 6.5h.01M9 6.5h.01"/>`,
    `<rect x="3" y="3" width="9" height="9" rx="2"/><rect x="16" y="3" width="9" height="9" rx="2"/><rect x="3" y="16" width="9" height="9" rx="2"/><rect x="16" y="16" width="9" height="9" rx="2"/>`,
    `<path d="M3 21a11 11 0 1 1 22 0"/><path d="m14 21 5-7"/>`,
    `<path d="M4 20c4-12 8-12 10-6s6 6 10-6"/><circle cx="24" cy="8" r="2"/>`,
  ];
  const W = 1200, cw = 592, ch = 220, gap = 16;
  const H = ch * 2 + gap;
  const body = items.map(([t, d], i) => {
    const x = (i % 2) * (cw + gap), y = Math.floor(i / 2) * (ch + gap);
    return `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cw - 1}" height="${ch - 1}" rx="22" fill="${C.surface}" stroke="${C.line}"/>
      <rect x="${x + 28}" y="${y + 28}" width="52" height="52" rx="14" fill="rgba(168,121,255,0.12)" stroke="rgba(168,121,255,0.3)"/>
      <g transform="translate(${x + 40} ${y + 40})" stroke="${C.accent}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">${icons[i]}</g>
      <text x="${x + cw - 28}" y="${y + 56}" text-anchor="end" class="m" font-size="14" fill="${C.muted}">0${i + 1}</text>
      <text x="${x + 28}" y="${y + 122}" class="s" font-size="25" font-weight="600" letter-spacing="-0.6" fill="${C.ink}">${esc(t)}</text>
      ${lines(wrap(d, cw - 56, 18.5), x + 28, y + 156, 27, `class="s" font-size="18.5" fill="${C.muted}"`)}`;
  }).join("");
  write("services.svg", svg(W, H, body, { title: "Services: landing pages and websites, web products, performance and SEO, interfaces with motion" }));
}

// ───────────────────────────── Stack (faixa rolando) ─────────────────────────────
function stack() {
  const icons = JSON.parse(readFileSync(join(SRC, "stack-icons.json"), "utf8"));
  const W = 1200, H = 84, fs = 18, gap = 52;
  let x = 0, row = "";
  for (const [name, paths] of Object.entries(icons)) {
    row += `<g transform="translate(${n(x)} 30) scale(1)" fill="${C.muted}">${paths.map((d) => `<path d="${d}"/>`).join("")}</g>`;
    row += `<text x="${n(x + 34)}" y="48" class="s" font-size="${fs}" font-weight="500" fill="${C.muted}">${esc(name)}</text>`;
    x += 34 + textWidth(name, fs) + gap;
  }
  const RW = n(x);
  const body = `
    <defs>
      <linearGradient id="fl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.bg}"/><stop offset="1" stop-color="${C.bg}" stop-opacity="0"/></linearGradient>
      <linearGradient id="fr" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${C.bg}"/><stop offset="1" stop-color="${C.bg}" stop-opacity="0"/></linearGradient>
      <clipPath id="cp"><rect width="${W}" height="${H}" rx="20"/></clipPath>
    </defs>
    <g clip-path="url(#cp)">
      <rect width="${W}" height="${H}" fill="${C.bg}"/>
      <g class="mq"><g transform="translate(24 0)">${row}</g><g transform="translate(${n(24 + RW)} 0)">${row}</g></g>
      <rect width="140" height="${H}" fill="url(#fl)"/>
      <rect x="${W - 140}" width="140" height="${H}" fill="url(#fr)"/>
    </g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" stroke="${C.line}"/>`;
  const css = `.mq{animation:mq 45s linear infinite}@keyframes mq{to{transform:translateX(-${RW}px)}}`;
  write("stack.svg", svg(W, H, body, { title: `Everyday tools: ${Object.keys(icons).join(", ")}`, css, mono: false }));
}

// ───────────────────────────── Sobre ─────────────────────────────
function about() {
  // Painel escuro com respiro, para funcionar também no tema claro do GitHub.
  const W = 1200, P = 36, IW = W - 2 * P;
  const [rw, rh] = webpSize("robson-480.webp");
  const phW = 380, phH = n((phW * rh) / rw);
  const x = phW + 52, tw = IW - x;
  const st = wrap("I got hooked on code tinkering with Counter-Strike 1.6 servers and never looked back. These days I live on the front-end: taking an idea, designing the interface and polishing it until every detail feels right.", tw, 27);
  const tl = [
    ["Age 12", "Built my first computer"],
    ["2023", "Started my degree in Systems Analysis and Development at IFG"],
    ["2025", "My capstone, Mind Health, was featured at IFG's first capstone showcase"],
    ["2026", "Graduated in March and co-founded RDL Development in October"],
  ];
  const ty = 30 + st.length * 38 + 34;
  let rows = "", y = ty;
  for (const [yr, t] of tl) {
    const tlines = wrap(t, tw - 130, 19);
    const hgt = 30 + tlines.length * 26;
    rows += `<line x1="${x}" x2="${IW}" y1="${y}" y2="${y}" stroke="${C.line}"/>
      <text x="${x}" y="${y + 37}" class="m" font-size="15" fill="${C.accent}">${esc(yr)}</text>
      ${lines(tlines, x + 120, y + 37, 26, `class="s" font-size="19" fill="${C.ink}"`)}`;
    y += hgt;
  }
  const H = Math.max(phH, y + 4) + 2 * P;
  const body = `
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="27.5" fill="${C.surface}" stroke="${C.line}"/>
    <g transform="translate(${P} ${P})">
    <defs><clipPath id="ph"><rect width="${phW}" height="${phH}" rx="24"/></clipPath>
      <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="${C.v2}" stop-opacity="0"/><stop offset="1" stop-color="${C.v2}" stop-opacity=".3"/></linearGradient></defs>
    <g clip-path="url(#ph)">
      <image href="${webp("robson-480.webp")}" width="${phW}" height="${phH}"/>
      <rect width="${phW}" height="${phH}" fill="url(#pf)"/>
    </g>
    <rect x=".5" y=".5" width="${phW - 1}" height="${phH - 1}" rx="23.5" stroke="${C.lineStrong}"/>
    <g transform="translate(20 ${phH - 56})">
      <rect width="170" height="36" rx="18" fill="rgba(10,7,16,0.75)" stroke="${C.lineStrong}"/>
      <path d="M22 11a6 6 0 0 0-6 6c0 4.5 6 9 6 9s6-4.5 6-9a6 6 0 0 0-6-6Z" stroke="${C.accent}" stroke-width="1.8" fill="none" transform="translate(-2 -2)"/>
      <text x="36" y="23" class="s" font-size="14" font-weight="600" fill="${C.ink}">Brasília, Brazil</text>
    </g>
    ${lines(st, x, 34, 38, `class="s" font-size="27" font-weight="500" letter-spacing="-0.6" fill="${C.ink}"`)}
    ${rows}
    <line x1="${x}" x2="${IW}" y1="${y}" y2="${y}" stroke="${C.line}"/>
    </g>`;
  write("about.svg", svg(W, H, body, { title: "About me: from Counter-Strike 1.6 servers to front-end development. Timeline: first computer at 12, IFG in 2023, capstone featured in 2025, graduated and co-founded RDL Development in 2026." }));
}

// ───────────────────────────── RDL ─────────────────────────────
function rdl() {
  const W = 1200, H = 230;
  const wm = readFileSync(join(SRC, "rdl-wordmark.svg"), "utf8");
  const wmH = 96, wmW = n((699 / 309) * wmH);
  const tx = 48 + wmW + 56;
  const t = wrap("I also co-founded RDL Development with Daniel Maciel and Luiz Henrique. When a project needs a full team, covering back-end, security and automation, we take it on together.", W - tx - 48, 21);
  const body = `
    <defs>${GRADS}<clipPath id="f"><rect width="${W}" height="${H}" rx="24"/></clipPath></defs>
    <g clip-path="url(#f)">
      <rect width="${W}" height="${H}" fill="${C.surface}"/>
      <circle class="au" cx="120" cy="${H}" r="260" fill="url(#au1)"/>
      <image href="data:image/svg+xml;base64,${Buffer.from(wm).toString("base64")}" x="48" y="${(H - wmH) / 2}" width="${wmW}" height="${wmH}"/>
      <line x1="${tx - 28}" x2="${tx - 28}" y1="48" y2="${H - 48}" stroke="${C.line}"/>
      ${lines(t, tx, 62, 31, `class="s" font-size="21" fill="${C.muted}"`)}
      <g transform="translate(${tx} ${62 + t.length * 31 - 4})">
        <rect width="142" height="40" rx="20" fill="${C.surface2}" stroke="${C.lineStrong}"/>
        <text x="18" y="25.5" class="s" font-size="15" font-weight="600" fill="${C.ink}">Meet RDL</text>
        ${ARROW_UR(108, 14, 0.9, C.accent)}
      </g>
    </g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="23.5" stroke="${C.line}"/>`;
  write("rdl.svg", svg(W, H, body, { title: "RDL Development — the studio I co-founded with Daniel Maciel and Luiz Henrique", css: AURORA_CSS, mono: false }));
}

// ───────────────────────────── Contato ─────────────────────────────
function contact() {
  const W = 1200, H = 300;
  const body = `
    <defs>${GRADS}<clipPath id="f"><rect width="${W}" height="${H}" rx="28"/></clipPath></defs>
    <g clip-path="url(#f)">
      <rect width="${W}" height="${H}" fill="${C.surface}"/>
      <circle class="au" cx="260" cy="40" r="320" fill="url(#au1)"/>
      <circle class="au au2" cx="980" cy="280" r="300" fill="url(#au2)"/>
      <text x="${W / 2}" y="${H / 2 - 4}" text-anchor="middle" class="s" font-size="62" font-weight="600" letter-spacing="-2.6"><tspan fill="url(#tg)">Got a project </tspan><tspan fill="url(#vg)">in mind?</tspan></text>
      <text x="${W / 2}" y="${H / 2 + 50}" text-anchor="middle" class="s" font-size="21" fill="${C.muted}">Tell me what you need. I usually reply within 24 hours, in English or Portuguese.</text>
    </g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="27.5" stroke="${C.line}"/>`;
  write("contact.svg", svg(W, H, body, { title: "Got a project in mind? Tell me what you need.", css: AURORA_CSS, mono: false }));
}

// ───────────────────────────── Rodapé ─────────────────────────────
function footer() {
  const W = 1200, H = 290;
  const body = `
    <defs>
      <linearGradient id="big" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(168,121,255)" stop-opacity=".4"/><stop offset="1" stop-color="rgb(168,121,255)" stop-opacity=".03"/></linearGradient>
      <linearGradient id="gl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgb(122,43,240)" stop-opacity=".25"/><stop offset="1" stop-color="rgb(122,43,240)" stop-opacity="0"/></linearGradient>
      <clipPath id="f"><rect width="${W}" height="${H}" rx="28"/></clipPath>
    </defs>
    <g clip-path="url(#f)">
      <rect width="${W}" height="${H}" fill="${C.bg}"/>
      ${logo("fl", 36, 30, 30)}
      <text x="80" y="51" class="s" font-size="16" fill="${C.muted}">© 2026 Robson Rodrigues. Made in Brasília.</text>
      <text x="${W - 36}" y="51" text-anchor="end" class="s" font-size="16" fill="${C.muted}">Thanks for stopping by ✦</text>
      <text class="rise s" x="${W / 2}" y="${H + 30}" text-anchor="middle" font-size="262" font-weight="800" letter-spacing="-16" fill="url(#big)">ROBSON</text>
      <rect y="${H - 100}" width="${W}" height="100" fill="url(#gl)"/>
    </g>
    <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="27.5" stroke="${C.line}"/>`;
  const css = `.rise{animation:rise 1.6s cubic-bezier(.23,1,.32,1) both}@keyframes rise{from{transform:translateY(60px);opacity:0}to{transform:none;opacity:1}}`;
  write("footer.svg", svg(W, H, body, { title: "© 2026 Robson Rodrigues", css, mono: false }));
}

hero();
button("portfolio", "Visit my portfolio", { primary: true });
button("talk", "Let's talk", { primary: true });
button("linkedin", "LinkedIn");
button("rdl", "RDL Development");
sectionTitle("work", "01", "Work", "Selected work", "Client sites, products of my own and side projects, all built for speed and polish.");
sectionTitle("building", "02", "Now building", "What I'm building now", "");
sectionTitle("services", "03", "Services", "How I can help", "I work solo or with the RDL team, from the first sketch to launch. Happy to work in English or Portuguese.");
sectionTitle("about", "04", "About", "About me", "");
sectionTitle("stats", "05", "GitHub", "On GitHub", "");
sectionTitle("contact", "06", "Contact", "Let's work together", "");
PROJECTS.forEach(projectCard);
candidarte();
services();
stack();
about();
rdl();
contact();
footer();
