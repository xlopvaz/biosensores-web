// ---------- Animaciones del mecanismo de cada biosensor ----------
// Esquemas simplificados con fines didácticos (no a escala).
// Cada animación dibuja una escena (izquierda) y la señal que genera (derecha).

const SVGNS = "http://www.w3.org/2000/svg";
const MECH_DURATION = 11000; // ms por ciclo completo

const clamp01 = (u) => Math.max(0, Math.min(1, u));
const smooth = (u) => { u = clamp01(u); return u * u * (3 - 2 * u); };
const seg = (t, a, b) => smooth((t - a) / (b - a));
const lerp = (a, b, u) => a + (b - a) * u;

const COL = {
  gold: "#c9a227",
  amber: "#f2a541",
  teal: "#5fd9c8",
  blue: "#4f7cff",
  green: "#7be08a",
  purple: "#a58bf0",
  quinone: "#ff7a59",
  muted: "#8fa8a6",
  text: "#eaf3f2",
  grid: "rgba(234,243,242,0.12)"
};

function el(tag, attrs = {}, parent) {
  const node = document.createElementNS(SVGNS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(node);
  return node;
}

function label(parent, x, y, text, opts = {}) {
  const t = el("text", {
    x, y,
    fill: opts.fill || COL.muted,
    "font-size": opts.size || 10,
    "font-family": "IBM Plex Mono, monospace",
    "text-anchor": opts.anchor || "start"
  }, parent);
  t.textContent = text;
  return t;
}

// Panel de señal a la derecha: ejes + una o más series que se dibujan con el tiempo
function buildChart(svg, series, yLabel) {
  const X0 = 372, X1 = 505, Y0 = 250, Y1 = 50;
  const g = el("g", {}, svg);
  el("rect", { x: 356, y: 30, width: 158, height: 246, rx: 8, fill: "rgba(10,31,39,0.55)", stroke: COL.grid }, g);
  el("line", { x1: X0, y1: Y0, x2: X1, y2: Y0, stroke: COL.grid }, g);
  el("line", { x1: X0, y1: Y1, x2: X0, y2: Y0, stroke: COL.grid }, g);
  label(g, X0, 268, "tiempo →", { size: 9 });
  label(g, 364, 44, yLabel, { size: 9 });
  const paths = series.map((s, i) => {
    const p = el("path", {
      fill: "none", stroke: s.color, "stroke-width": 2.2,
      "stroke-dasharray": s.dashed ? "4 3" : "none", "stroke-linecap": "round"
    }, g);
    if (s.name) {
      el("rect", { x: X0 + 2, y: 56 + i * 14, width: 10, height: 3, fill: s.color }, g);
      label(g, X0 + 16, 60 + i * 14, s.name, { size: 8.5 });
    }
    return p;
  });
  return (t) => {
    series.forEach((s, i) => {
      let d = "";
      const n = 70;
      for (let k = 0; k <= n; k++) {
        const tt = (t * k) / n;
        const x = X0 + (tt) * (X1 - X0);
        const y = Y0 - clamp01(s.fn(tt)) * (Y0 - Y1 - 30);
        d += (k === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
      }
      paths[i].setAttribute("d", d);
    });
  };
}

// e⁻ que se desplaza entre dos alturas en bucle
function electron(parent, color = COL.teal) {
  const t = label(parent, 0, 0, "e⁻", { fill: color, size: 10 });
  t.setAttribute("opacity", 0);
  return t;
}

// ---------- 1. Vancomicina: biosensor electroquímico de aptámero (E-AB) ----------
const MECH_VANCO = {
  title: "Biosensor electroquímico de aptámero (E-AB)",
  yLabel: "corriente (u.a.)",
  steps: [
    { t: 0.00, text: "Aptámeros de ADN anclados a un electrodo de oro, con una molécula redox (azul de metileno, MB) en su extremo." },
    { t: 0.22, text: "La vancomicina del suero llega a la superficie y se une selectivamente a los aptámeros." },
    { t: 0.50, text: "Al unirse, el aptámero cambia de conformación y el MB queda a otra distancia del electrodo." },
    { t: 0.74, text: "Cambia la velocidad de transferencia electrónica: la corriente (voltametría de onda cuadrada) depende de la concentración." }
  ],
  build(svg) {
    const s = {};
    el("rect", { x: 10, y: 250, width: 330, height: 16, rx: 3, fill: COL.gold }, svg);
    label(svg, 14, 288, "electrodo de oro", { size: 9.5 });
    s.xs = [50, 110, 170, 230, 290];
    s.binds = [true, true, false, true, true];
    s.apt = s.xs.map((x, i) => {
      const path = el("path", { fill: "none", stroke: "#cfd8e6", "stroke-width": 2.4, "stroke-linecap": "round" }, svg);
      const mb = el("circle", { r: 6.5, fill: COL.blue }, svg);
      const mol = el("g", {}, svg);
      el("circle", { r: 8, fill: COL.amber }, mol);
      el("circle", { r: 3, fill: "#16100a", opacity: 0.35 }, mol);
      const e = electron(svg, COL.teal);
      return { x, path, mb, mol, e, land: 0.26 + 0.06 * i };
    });
    s.mbLabel = label(svg, 62, 134, "MB", { fill: COL.blue, size: 10 });
    s.drugLabel = label(svg, 340, 22, "● vancomicina (suero)", { fill: COL.amber, size: 10, anchor: "end" });
    s.chart = buildChart(svg, [{ color: COL.teal, fn: (tt) => this.signal(s, tt) }], "corriente (u.a.)");
    return s;
  },
  fold(s, i, t) { return s.binds[i] ? seg(t, s.apt[i].land + 0.14, s.apt[i].land + 0.3) : 0; },
  signal(s, t) {
    let sum = 0;
    s.apt.forEach((_, i) => { sum += this.fold(s, i, t); });
    return 0.18 + 0.62 * (sum / s.apt.length) / 0.8;
  },
  frame(s, t) {
    s.apt.forEach((a, i) => {
      const f = this.fold(s, i, t);
      const x = a.x;
      // extendido: recto hacia arriba; plegado: horquilla cerca del electrodo
      const p = [
        [x, 250],
        [lerp(x - 12, x + 30, f), lerp(212, 236, f)],
        [lerp(x + 12, x + 32, f), lerp(172, 198, f)],
        [lerp(x, x + 8, f), lerp(140, 222, f)]
      ];
      a.path.setAttribute("d", `M${p[0][0]},${p[0][1]} C${p[1][0]},${p[1][1]} ${p[2][0]},${p[2][1]} ${p[3][0]},${p[3][1]}`);
      const mbx = p[3][0], mby = p[3][1] - 7;
      a.mb.setAttribute("cx", mbx); a.mb.setAttribute("cy", mby);

      if (s.binds[i]) {
        const fall = seg(t, a.land - 0.12, a.land);
        const mx = lerp(x + 34, lerp(x + 12, x + 26, f), fall);
        const my = lerp(-20, lerp(176, 214, f), fall);
        a.mol.setAttribute("transform", `translate(${mx},${my})`);
        a.mol.setAttribute("opacity", t > a.land - 0.13 ? 1 : 0);
      } else {
        a.mol.setAttribute("opacity", 0);
      }
      // electrones entre MB y electrodo, más intensos cuanto más plegado
      const cyc = (t * 9 + i * 0.37) % 1;
      a.e.setAttribute("x", mbx - 4);
      a.e.setAttribute("y", lerp(mby + 10, 248, cyc));
      a.e.setAttribute("opacity", (t > 0.5 ? f : 0) * (1 - cyc) * 0.95);
    });
    s.mbLabel.setAttribute("opacity", 1 - seg(t, 0.2, 0.3));
    s.drugLabel.setAttribute("opacity", seg(t, 0.15, 0.22) * (1 - seg(t, 0.85, 0.95)));
    s.chart(t);
  }
};

// ---------- 2. Tacrolimus: inmunoensayo competitivo en guía de ondas ----------
const MECH_TACRO = {
  title: "Inmunosensor óptico competitivo en guía de ondas plana",
  steps: [
    { t: 0.00, text: "Anticuerpos anti-tacrolimus inmovilizados sobre una guía de ondas plana por la que viaja luz." },
    { t: 0.22, text: "El tacrolimus de la muestra compite con un trazador fluorescente por los mismos anticuerpos." },
    { t: 0.55, text: "La luz guiada solo excita lo que está unido a la superficie (campo evanescente): brilla el trazador unido." },
    { t: 0.76, text: "Cuanto más tacrolimus hay en la muestra, menos trazador se une y menor es la fluorescencia: señal inversa." }
  ],
  build(svg) {
    const s = {};
    el("rect", { x: 10, y: 250, width: 330, height: 14, rx: 3, fill: "rgba(95,217,200,0.28)", stroke: "rgba(95,217,200,0.5)" }, svg);
    s.ray = el("line", { x1: 12, y1: 257, x2: 338, y2: 257, stroke: COL.teal, "stroke-width": 2, "stroke-dasharray": "10 14" }, svg);
    label(svg, 14, 288, "guía de ondas plana", { size: 9.5 });
    s.xs = [50, 110, 170, 230, 290];
    s.kind = ["drug", "tracer", "drug", "drug", "tracer"];
    s.items = s.xs.map((x, i) => {
      el("path", { d: `M${x},250 L${x},226 M${x},226 L${x - 11},208 M${x},226 L${x + 11},208`, stroke: "#cfd8e6", "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, svg);
      const g = el("g", {}, svg);
      const halo = el("circle", { r: 16, fill: COL.green, opacity: 0 }, g);
      el("circle", { r: 8, fill: s.kind[i] === "drug" ? COL.amber : COL.green }, g);
      return { x, g, halo, land: 0.28 + 0.05 * i, from: x + (i % 2 ? -36 : 36) };
    });
    s.lDrug = label(svg, 18, 40, "● tacrolimus (muestra)", { fill: COL.amber, size: 10 });
    s.lTracer = label(svg, 190, 40, "● trazador fluorescente", { fill: COL.green, size: 10 });
    s.chart = buildChart(svg, [
      { color: COL.muted, dashed: true, name: "sin fármaco", fn: (tt) => 0.12 + 0.72 * seg(tt, 0.58, 0.74) },
      { color: COL.green, name: "con fármaco", fn: (tt) => 0.12 + 0.3 * seg(tt, 0.58, 0.74) }
    ], "fluorescencia (u.a.)");
    return s;
  },
  frame(s, t) {
    s.ray.setAttribute("stroke-dashoffset", (-t * 600).toFixed(1));
    s.items.forEach((it, i) => {
      const fall = seg(t, it.land - 0.12, it.land);
      const x = lerp(it.from, it.x, fall), y = lerp(-20, 199, fall);
      it.g.setAttribute("transform", `translate(${x},${y})`);
      it.g.setAttribute("opacity", t > it.land - 0.13 ? 1 : 0);
      if (s.kind[i] === "tracer") {
        const on = seg(t, 0.56, 0.66);
        it.halo.setAttribute("opacity", (on * (0.25 + 0.2 * Math.sin(t * 60))).toFixed(2));
      }
    });
    const lab = seg(t, 0.16, 0.24) * (1 - seg(t, 0.85, 0.95));
    s.lDrug.setAttribute("opacity", lab);
    s.lTracer.setAttribute("opacity", lab);
    s.chart(t);
  }
};

// ---------- 3. Metformina: parche P²One (MIP + azul de Prusia + glucosa oxidasa) ----------
const MECH_METF = {
  title: "Parche epidérmico P²One: dos canales en sudor",
  steps: [
    { t: 0.00, text: "El sudor llega al parche, que tiene dos electrodos sobre aerogeles de carbono con azul de Prusia (PB)." },
    { t: 0.22, text: "Canal 1: la metformina ocupa las cavidades del polímero de impronta molecular (MIP), hechas a su medida." },
    { t: 0.48, text: "La ocupación de las cavidades modifica la señal redox del azul de Prusia (en este esquema, la bloquea en parte)." },
    { t: 0.70, text: "Canal 2: la glucosa oxidasa genera H₂O₂, que el azul de Prusia reduce. Fármaco (PK) y respuesta (PD) a la vez." }
  ],
  build(svg) {
    const s = {};
    [[15, "MIP · metformina"], [185, "GOx · glucosa"]].forEach(([x0, name]) => {
      el("rect", { x: x0, y: 258, width: 150, height: 10, rx: 2, fill: "#3a4650" }, svg);
      el("rect", { x: x0, y: 248, width: 150, height: 10, rx: 2, fill: "#2a5db0" }, svg);
      label(svg, x0 + 2, 288, name, { size: 9.5 });
    });
    label(svg, 344, 256, "PB", { fill: "#7fa3ea", size: 9, anchor: "end" });
    el("rect", { x: 15, y: 226, width: 150, height: 22, rx: 2, fill: "rgba(242,165,65,0.16)", stroke: "rgba(242,165,65,0.4)" }, svg);
    s.cav = [33, 68, 103, 138];
    s.cav.forEach((cx) => el("rect", { x: cx, y: 230, width: 16, height: 13, rx: 3, fill: "rgba(10,31,39,0.9)" }, svg));
    s.drops = [40, 95, 150, 215, 270, 320].map((x, i) => {
      const d = el("path", { d: "M0,-7 C5,0 5,6 0,7 C-5,6 -5,0 0,-7 Z", fill: "rgba(140,190,255,0.7)" }, svg);
      return { d, x, off: i * 0.025 };
    });
    s.sweat = label(svg, 140, 22, "sudor", { fill: "#8cbeff", size: 10 });
    s.met = [0, 1, 3].map((ci, i) => ({ g: el("circle", { r: 5.5, fill: COL.amber }, svg), ci, from: 30 + i * 50, t0: 0.26 + i * 0.06 }));
    s.enz = [215, 260, 305].map((x) => { el("ellipse", { cx: x, cy: 236, rx: 13, ry: 9, fill: COL.purple, opacity: 0.85 }, svg); return x; });
    s.glu = s.enz.map((x, i) => ({ g: el("rect", { width: 9, height: 9, rx: 2, fill: COL.green }, svg), x, t0: 0.3 + i * 0.05 }));
    s.h2o2 = s.enz.map((x) => { const t = label(svg, 0, 0, "H₂O₂", { fill: "#eaf3f2", size: 8.5 }); return { t, x }; });
    s.eL = [40, 90, 140].map(() => electron(svg, COL.amber));
    s.eR = [215, 260, 305].map(() => electron(svg, COL.teal));
    s.chart = buildChart(svg, [
      { color: COL.amber, name: "metformina", fn: (tt) => 0.78 - 0.42 * seg(tt, 0.32, 0.62) },
      { color: COL.teal, name: "glucosa", fn: (tt) => 0.12 + 0.5 * seg(tt, 0.62, 0.86) }
    ], "corriente (u.a.)");
    return s;
  },
  frame(s, t) {
    s.drops.forEach((d) => {
      const u = seg(t, d.off, 0.2 + d.off);
      d.d.setAttribute("transform", `translate(${d.x},${lerp(-10, 120, u)})`);
      d.d.setAttribute("opacity", (1 - seg(t, 0.18 + d.off, 0.26 + d.off)).toFixed(2));
    });
    s.sweat.setAttribute("opacity", 1 - seg(t, 0.2, 0.28));
    s.met.forEach((m) => {
      const u = seg(t, m.t0, m.t0 + 0.16);
      const cx = s.cav[m.ci] + 8;
      m.g.setAttribute("cx", lerp(m.from, cx, u));
      m.g.setAttribute("cy", lerp(-10, 237, u));
      m.g.setAttribute("opacity", t > m.t0 - 0.01 ? 1 : 0);
    });
    s.glu.forEach((g) => {
      const u = seg(t, g.t0, g.t0 + 0.14);
      g.g.setAttribute("x", lerp(g.x + 20, g.x - 4, u));
      g.g.setAttribute("y", lerp(-10, 214, u));
      g.g.setAttribute("opacity", (t > g.t0 - 0.01 ? 1 : 0) * (1 - seg(t, 0.56, 0.62)));
    });
    s.h2o2.forEach((h, i) => {
      const u = seg(t, 0.6 + i * 0.03, 0.72 + i * 0.03);
      h.t.setAttribute("x", h.x - 12);
      h.t.setAttribute("y", lerp(222, 247, u));
      h.t.setAttribute("opacity", (t > 0.58 ? 1 : 0) * (1 - seg(t, 0.8, 0.86)));
    });
    // canal metformina: menos electrones según se ocupan las cavidades
    const block = 1 - 0.8 * seg(t, 0.36, 0.62);
    s.eL.forEach((e, i) => {
      const c = (t * 8 + i * 0.33) % 1;
      e.setAttribute("x", [36, 86, 136][i]);
      e.setAttribute("y", lerp(258, 274, c));
      e.setAttribute("opacity", (t > 0.08 ? block : 0) * (1 - c));
    });
    const glu = seg(t, 0.66, 0.82);
    s.eR.forEach((e, i) => {
      const c = (t * 8 + i * 0.33) % 1;
      e.setAttribute("x", s.enz[i] - 4);
      e.setAttribute("y", lerp(258, 274, c));
      e.setAttribute("opacity", glu * (1 - c));
    });
    s.chart(t);
  }
};

// ---------- 4. L-DOPA: banda de sudor con tirosinasa (Caltech) ----------
const MECH_LDOPA = {
  title: "Banda de sudor enzimática (tirosinasa) para L-DOPA",
  steps: [
    { t: 0.00, text: "La iontoforesis estimula la sudoración en la piel del paciente, que tiene la movilidad reducida." },
    { t: 0.24, text: "La L-DOPA del sudor llega a la tirosinasa inmovilizada sobre un electrodo de oro nanoestructurado." },
    { t: 0.46, text: "La tirosinasa oxida la L-DOPA a dopaquinona." },
    { t: 0.64, text: "La dopaquinona se reduce en el electrodo: la corriente es proporcional a la concentración de L-DOPA en sudor." }
  ],
  build(svg) {
    const s = {};
    el("rect", { x: 10, y: 6, width: 330, height: 22, rx: 4, fill: "#c8937a", opacity: 0.85 }, svg);
    label(svg, 16, 21, "piel", { fill: "#2b1a12", size: 10 });
    s.bolts = [70, 175, 280].map((x) => el("path", { d: `M${x},30 l-6,12 h7 l-5,12`, stroke: "#ffe27a", "stroke-width": 2, fill: "none" }, svg));
    s.drops = [55, 120, 190, 255, 310].map((x, i) => ({ d: el("path", { d: "M0,-7 C5,0 5,6 0,7 C-5,6 -5,0 0,-7 Z", fill: "rgba(140,190,255,0.7)" }, svg), x, off: 0.05 + i * 0.025 }));
    el("rect", { x: 10, y: 250, width: 330, height: 16, rx: 3, fill: COL.gold }, svg);
    let spikes = "";
    for (let x = 16; x < 336; x += 16) spikes += `M${x},250 L${x + 8},236 L${x + 16},250 `;
    el("path", { d: spikes, fill: COL.gold, opacity: 0.85 }, svg);
    label(svg, 14, 288, "electrodo de oro nanoestructurado", { size: 9.5 });
    s.enz = [60, 130, 200, 270].map((x) => { el("ellipse", { cx: x, cy: 228, rx: 14, ry: 9, fill: COL.purple, opacity: 0.9 }, svg); return x; });
    label(svg, 290, 214, "tirosinasa", { fill: COL.purple, size: 9.5 });
    s.mol = s.enz.map((x, i) => ({ g: el("circle", { r: 7, fill: COL.amber }, svg), x, t0: 0.26 + i * 0.04 }));
    s.lDopa = label(svg, 20, 120, "● L-DOPA", { fill: COL.amber, size: 10 });
    s.lQuin = label(svg, 110, 120, "● dopaquinona", { fill: COL.quinone, size: 10 });
    s.e = s.enz.map(() => electron(svg, COL.teal));
    s.chart = buildChart(svg, [{ color: COL.teal, fn: (tt) => 0.12 + 0.62 * seg(tt, 0.66, 0.84) }], "|corriente| (u.a.)");
    return s;
  },
  frame(s, t) {
    s.bolts.forEach((b, i) => b.setAttribute("opacity", ((1 - seg(t, 0.2, 0.26)) * (0.5 + 0.5 * Math.sin(t * 90 + i))).toFixed(2)));
    s.drops.forEach((d) => {
      const u = seg(t, d.off, d.off + 0.18);
      d.d.setAttribute("transform", `translate(${d.x},${lerp(30, 150, u)})`);
      d.d.setAttribute("opacity", (t > d.off - 0.01 ? 1 : 0) * (1 - seg(t, d.off + 0.16, d.off + 0.24)));
    });
    s.mol.forEach((m) => {
      const u = seg(t, m.t0, m.t0 + 0.14);
      const down = seg(t, 0.62, 0.72);
      m.g.setAttribute("cx", lerp(m.x - 26, m.x, u));
      m.g.setAttribute("cy", lerp(40, lerp(210, 238, down), u));
      m.g.setAttribute("opacity", t > m.t0 - 0.01 ? 1 : 0);
      const ox = seg(t, 0.48, 0.58);
      const back = seg(t, 0.8, 0.9);
      m.g.setAttribute("fill", ox > 0.5 && back < 0.5 ? COL.quinone : COL.amber);
    });
    s.lDopa.setAttribute("opacity", seg(t, 0.22, 0.3) * (1 - seg(t, 0.85, 0.95)));
    s.lQuin.setAttribute("opacity", seg(t, 0.48, 0.56) * (1 - seg(t, 0.85, 0.95)));
    const on = seg(t, 0.66, 0.78);
    s.e.forEach((e, i) => {
      const c = (t * 9 + i * 0.29) % 1;
      e.setAttribute("x", s.enz[i] + 10);
      e.setAttribute("y", lerp(250, 232, c));
      e.setAttribute("opacity", on * (1 - c));
    });
    s.chart(t);
  }
};

const MECHANISMS = { vanco: MECH_VANCO, tacro: MECH_TACRO, metf: MECH_METF, ldopa: MECH_LDOPA };

// ---------- Reproductor ----------
let currentMech = null;

function mountMechanism(key, container) {
  if (currentMech) currentMech.destroy();
  const def = MECHANISMS[key];
  if (!def) { container.innerHTML = ""; return; }

  container.innerHTML = `
    <div class="mech-head">
      <span class="mech-kicker">cómo funciona</span>
      <span class="mech-title">${def.title}</span>
    </div>
    <svg viewBox="0 0 520 300" class="mech-svg" role="img" aria-label="Animación del mecanismo: ${def.title}"></svg>
    <div class="mech-progress"><div class="mech-progress-bar"></div></div>
    <p class="mech-caption" aria-live="polite"></p>
    <div class="mech-controls">
      <button type="button" class="mech-btn mech-play" aria-label="Pausar">❚❚</button>
      <button type="button" class="mech-btn mech-restart" aria-label="Repetir desde el principio">↺</button>
      <div class="mech-steps">
        ${def.steps.map((_, i) => `<button type="button" class="mech-step" data-i="${i}" aria-label="Ir al paso ${i + 1}">${i + 1}</button>`).join("")}
      </div>
    </div>
    <p class="mech-disclaimer">Esquema simplificado con fines didácticos, no a escala. La señal es ilustrativa, no son datos experimentales.</p>
  `;

  const svg = container.querySelector(".mech-svg");
  const caption = container.querySelector(".mech-caption");
  const bar = container.querySelector(".mech-progress-bar");
  const playBtn = container.querySelector(".mech-play");
  const restartBtn = container.querySelector(".mech-restart");
  const stepBtns = [...container.querySelectorAll(".mech-step")];

  const state = def.build(svg);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let t = 0, playing = !reduced, last = null, raf = null, lastStep = -1, started = false;

  function stepIndex(tt) {
    let idx = 0;
    def.steps.forEach((s, i) => { if (tt >= s.t) idx = i; });
    return idx;
  }

  function render() {
    def.frame(state, t);
    bar.style.width = (t * 100).toFixed(1) + "%";
    const idx = stepIndex(t);
    if (idx !== lastStep) {
      caption.innerHTML = `<span class="mech-n">${idx + 1}/${def.steps.length}</span> ${def.steps[idx].text}`;
      stepBtns.forEach((b, i) => b.classList.toggle("active", i === idx));
      lastStep = idx;
    }
    playBtn.textContent = playing ? "❚❚" : "▶";
    playBtn.setAttribute("aria-label", playing ? "Pausar" : "Reproducir");
  }

  function tick(now) {
    if (last === null) last = now;
    const dt = now - last; last = now;
    if (playing) {
      t += dt / MECH_DURATION;
      if (t >= 1) { t = 1; playing = false; }
    }
    render();
    raf = playing ? requestAnimationFrame(tick) : null;
  }

  function play() {
    if (t >= 1) t = 0;
    playing = true; last = null;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function pause() { playing = false; render(); }

  playBtn.addEventListener("click", () => (playing ? pause() : play()));
  restartBtn.addEventListener("click", () => { t = 0; play(); });
  stepBtns.forEach((b, i) => b.addEventListener("click", () => {
    // ir al final del paso elegido (o al principio del siguiente) para verlo completo
    const next = def.steps[i + 1] ? def.steps[i + 1].t - 0.005 : 1;
    t = reduced ? next : def.steps[i].t;
    if (reduced) { pause(); } else { play(); }
  }));

  // Empieza a reproducir solo cuando la animación es visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting && !started) {
        started = true;
        if (!reduced) play();
      }
    });
  }, { threshold: 0.35 });
  io.observe(svg);

  if (reduced) { t = 1; playing = false; }
  render();

  currentMech = {
    destroy() { if (raf) cancelAnimationFrame(raf); io.disconnect(); }
  };
}
