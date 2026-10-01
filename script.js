// ---------- Datos: parámetros de validación ----------
const PARAMS = [
  {
    nombre: "LOD / LOQ",
    evalua: "Menor concentración detectable (LOD) o cuantificable con fiabilidad estadística (LOQ).",
    particularidad: "Debe cubrir el extremo inferior de la ventana terapéutica del fármaco."
  },
  {
    nombre: "Rango lineal",
    evalua: "Intervalo de concentraciones en el que la señal responde linealmente.",
    particularidad: "Debe abarcar de forma continua todo el rango terapéutico y, si es posible, parte del rango tóxico."
  },
  {
    nombre: "Precisión (repetibilidad / reproducibilidad)",
    evalua: "Dispersión de los resultados en medidas repetidas.",
    particularidad: "Se evalúa intra-día, inter-día e inter-dispositivo, dado que la variabilidad de fabricación del electrodo puede ser relevante."
  },
  {
    nombre: "Exactitud / recuperación",
    evalua: "Cercanía al valor verdadero.",
    particularidad: "Idealmente se evalúa en matriz biológica real, no solo en disolución tampón."
  },
  {
    nombre: "Selectividad",
    evalua: "Ausencia de interferencia de otras especies.",
    particularidad: "Debe comprobarse frente a metabolitos del fármaco, otros fármacos co-administrados y componentes propios de la matriz."
  },
  {
    nombre: "Estabilidad de la señal",
    evalua: "Constancia de la respuesta a lo largo del tiempo.",
    particularidad: "Especialmente relevante en monitorización continua, por fenómenos como el bioensuciamiento del electrodo."
  },
  {
    nombre: "Comparación con método de referencia",
    evalua: "Concordancia con la técnica de referencia habitual (cromatografía, inmunoensayo...).",
    particularidad: "Suele apoyarse en muestras de matriz real, no solo en disolución tampón."
  }
];

// ---------- Datos: casos de estudio ----------
const CASES = {
  vanco: {
    title: "Vancomicina",
    sub: "Biosensor electroquímico de aptámero (E-AB) validado frente a inmunoensayo clínico",
    stats: [
      { label: "tipo de sensor", value: "Aptámero (E-AB)" },
      { label: "matriz validada", value: "Suero de pacientes reales" },
      { label: "comparado con", value: "Inmunoensayo automatizado" },
      { label: "resultado clave", value: "Concordancia y selectividad adecuadas" }
    ],
    note: "Es un buen ejemplo de validación completa porque no se queda en el laboratorio: se compara directamente contra el método clínico, en matriz real y en pacientes.",
    ref: "Liu et al., 2024 — ACS Sensors"
  },
  tacro: {
    title: "Tacrolimus",
    sub: "Distintos biosensores ópticos cubriendo la ventana terapéutica del fármaco",
    stats: [
      { label: "LOD típico", value: "0,02 – 3 ng/mL" },
      { label: "rango dinámico", value: "hasta 70 ng/mL" },
      { label: "ventana terapéutica clínica", value: "5 – 20 ng/mL" },
      { label: "selectividad", value: "frente a otros inmunosupresores co-administrados" }
    ],
    note: "Varios desarrollos superan en sensibilidad a los inmunoensayos de electroquimioluminiscencia usados de rutina en la práctica clínica.",
    ref: "Glahn-Martínez et al., 2022 y 2024 — Analytical Chemistry"
  },
  metf: {
    title: "Metformina",
    sub: "Parche epidérmico no invasivo: metformina (PK) y glucosa (PD) a la vez, en sudor",
    stats: [
      { label: "LOD metformina", value: "1,16 nM" },
      { label: "rango lineal", value: "10 nM – 10 μM" },
      { label: "correlación con GC-MS/MS", value: "r = 0,852" },
      { label: "correlación sudor–plasma", value: "r = 0,793" }
    ],
    note: "La validación cruzada sudor–plasma es lo que permitió definir un rango terapéutico en sudor equivalente al ya conocido en plasma.",
    ref: "Zheng et al., 2026 — Biosensors and Bioelectronics"
  }
};

// ---------- Datos: rangos para la calculadora ----------
const RANGES = {
  vanco: {
    unit: "mg·h/L (AUC24h)",
    low: 370, high: 540,
    source: "Rango propuesto para Enterococcus spp.: AUC24h 370–540 mg·h/L (Zhu et al., 2026).",
    labelLow: "Por debajo del umbral de eficacia (≥370)",
    labelOk: "Dentro de la ventana terapéutica propuesta",
    labelHigh: "Por encima de 540 — asociado a mayor riesgo de nefrotoxicidad (AKI)"
  },
  tacro: {
    unit: "ng/mL",
    low: 5, high: 20,
    source: "Ventana terapéutica clínica habitual para tacrolimus: 5–20 ng/mL.",
    labelLow: "Por debajo de la ventana terapéutica — riesgo de infradosificación / rechazo",
    labelOk: "Dentro de la ventana terapéutica habitual",
    labelHigh: "Por encima de la ventana terapéutica — riesgo de toxicidad"
  },
  metf: {
    unit: "μM (sudor)",
    low: 0.77, high: 3.10,
    source: "Rango seguro y terapéutico en sudor definido por correlación con plasma: 0,77–3,10 μM (Zheng et al., 2026).",
    labelLow: "Por debajo del rango terapéutico definido en sudor",
    labelOk: "Dentro del rango seguro y terapéutico en sudor",
    labelHigh: "Por encima del rango — posible riesgo de efecto adverso"
  }
};

// ---------- Renderizar acordeón de parámetros ----------
function renderParams() {
  const container = document.getElementById("paramList");
  PARAMS.forEach((p, i) => {
    const item = document.createElement("div");
    item.className = "param-item";
    item.innerHTML = `
      <button class="param-trigger" aria-expanded="false">
        <span>${p.nombre}</span>
        <span class="plus">+</span>
      </button>
      <div class="param-body">
        <div class="param-body-inner">
          <div>
            <div class="label">evalúa</div>
            <p>${p.evalua}</p>
          </div>
          <div>
            <div class="label">en biosensores TDM</div>
            <p>${p.particularidad}</p>
          </div>
        </div>
      </div>
    `;
    const trigger = item.querySelector(".param-trigger");
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
    container.appendChild(item);
  });
}

// ---------- Renderizar panel de casos ----------
function renderCase(key) {
  const c = CASES[key];
  const panel = document.getElementById("casePanel");
  panel.innerHTML = `
    <h3 class="case-title">${c.title}</h3>
    <p class="case-sub">${c.sub}</p>
    <div class="case-stats">
      ${c.stats.map(s => `
        <div class="stat-box">
          <div class="stat-label">${s.label}</div>
          <div class="stat-value">${s.value}</div>
        </div>
      `).join("")}
    </div>
    <p class="case-note">${c.note}</p>
    <p class="case-ref">${c.ref}</p>
  `;
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderCase(tab.dataset.case);
    });
  });
  renderCase("vanco");
}

// ---------- Calculadora de zona terapéutica ----------
function setupCalc() {
  const drugSelect = document.getElementById("drugSelect");
  const valueInput = document.getElementById("valueInput");
  const btn = document.getElementById("calcBtn");
  const result = document.getElementById("calcResult");
  const sourceEl = document.getElementById("calcSource");

  function updateSource() {
    const r = RANGES[drugSelect.value];
    sourceEl.textContent = r.source;
  }
  drugSelect.addEventListener("change", updateSource);
  updateSource();

  btn.addEventListener("click", () => {
    const val = parseFloat(valueInput.value);
    const r = RANGES[drugSelect.value];

    result.classList.remove("status-ok", "status-low", "status-high");

    if (isNaN(val)) {
      result.textContent = "Introduce un valor numérico para evaluar.";
      result.classList.add("show", "status-low");
      return;
    }

    let status, label;
    if (val < r.low) {
      status = "status-low"; label = r.labelLow;
    } else if (val > r.high) {
      status = "status-high"; label = r.labelHigh;
    } else {
      status = "status-ok"; label = r.labelOk;
    }

    result.textContent = `${val} ${r.unit} → ${label}`;
    result.classList.add("show", status);
  });
}

// ---------- Simulador 1: curva de calibración ----------
const calLOD = -8;      // log10(M) límite de detección ilustrativo
const calEC50 = -6;     // log10(M) punto medio de la curva (sensibilidad máxima)
const calHigh = -4;     // log10(M) a partir de aquí se considera saturación

function calSignal(logC) {
  // Hill function normalizada (0-100%) centrada en calEC50
  const x = logC - calEC50;
  return 100 / (1 + Math.pow(10, -x * 1.6));
}

function formatConc(logC) {
  const molar = Math.pow(10, logC);
  if (molar < 1e-6) return (molar * 1e9).toFixed(1) + " nM";
  if (molar < 1e-3) return (molar * 1e6).toFixed(1) + " μM";
  return (molar * 1e3).toFixed(1) + " mM";
}

function drawCalSvg() {
  const svg = document.getElementById("calSvg");
  const W = 440, H = 240, pad = 36;
  const xMin = -9, xMax = -3;

  const xToPx = (logC) => pad + ((logC - xMin) / (xMax - xMin)) * (W - pad * 1.4);
  const yToPx = (signal) => (H - pad) - (signal / 100) * (H - pad * 1.6);

  let path = "";
  for (let lc = xMin; lc <= xMax; lc += 0.1) {
    const px = xToPx(lc), py = yToPx(calSignal(lc));
    path += (lc === xMin ? "M" : "L") + px.toFixed(1) + "," + py.toFixed(1) + " ";
  }

  const lodPx = xToPx(calLOD);

  svg.innerHTML = `
    <line x1="${pad}" y1="${H - pad}" x2="${W - 10}" y2="${H - pad}" stroke="var(--border)" stroke-width="1"/>
    <line x1="${pad}" y1="${pad * 0.5}" x2="${pad}" y2="${H - pad}" stroke="var(--border)" stroke-width="1"/>
    <line x1="${lodPx}" y1="${pad * 0.5}" x2="${lodPx}" y2="${H - pad}" stroke="#ff9b9b" stroke-width="1" stroke-dasharray="4 3"/>
    <text x="${lodPx}" y="${pad * 0.5 - 6}" fill="#ff9b9b" font-size="9" font-family="IBM Plex Mono, monospace" text-anchor="middle">LOD</text>
    <path d="${path}" fill="none" stroke="var(--amber)" stroke-width="2.2"/>
    <circle id="calPoint" cx="0" cy="0" r="5" fill="var(--teal)"/>
    <text x="${pad}" y="${H - 10}" fill="var(--text-muted)" font-size="9" font-family="IBM Plex Mono, monospace">nM</text>
    <text x="${W - 30}" y="${H - 10}" fill="var(--text-muted)" font-size="9" font-family="IBM Plex Mono, monospace">mM</text>
  `;
  updateCalPoint(parseFloat(document.getElementById("calSlider").value));
}

function updateCalPoint(logC) {
  const svg = document.getElementById("calSvg");
  const W = 440, H = 240, pad = 36;
  const xMin = -9, xMax = -3;
  const xToPx = (lc) => pad + ((lc - xMin) / (xMax - xMin)) * (W - pad * 1.4);
  const yToPx = (s) => (H - pad) - (s / 100) * (H - pad * 1.6);

  const signal = calSignal(logC);
  const point = svg.querySelector("#calPoint");
  if (point) {
    point.setAttribute("cx", xToPx(logC).toFixed(1));
    point.setAttribute("cy", yToPx(signal).toFixed(1));
  }

  document.getElementById("calReadout").textContent =
    `${formatConc(logC)} → señal ${signal.toFixed(0)}%`;

  const statusEl = document.getElementById("calStatus");
  if (logC < calLOD) {
    statusEl.textContent = "Por debajo del LOD — no sería detectable de forma fiable.";
    statusEl.className = "sim-status low";
  } else if (logC > calHigh) {
    statusEl.textContent = "Cerca de la saturación — fuera del rango lineal útil.";
    statusEl.className = "sim-status high";
  } else {
    statusEl.textContent = "Dentro del rango lineal de trabajo.";
    statusEl.className = "sim-status ok";
  }
}

function setupCalSim() {
  drawCalSvg();
  document.getElementById("calSlider").addEventListener("input", (e) => {
    updateCalPoint(parseFloat(e.target.value));
  });
}

// ---------- Simulador 2: perfil farmacocinético ----------
const PK_PARAMS = {
  vanco: {
    name: "Vancomicina", ka: 1.1, ke: 0.14, tEnd: 24, lagH: 1,
    band: [10, 14], unit: "mg/L (Cmín, ilustrativo)",
    bandSource: "Banda de Cmín propuesta por Zhu et al., 2026 para Enterococcus spp."
  },
  tacro: {
    name: "Tacrolimus", ka: 1.4, ke: 0.09, tEnd: 24, lagH: 1.5,
    band: [5, 20], unit: "ng/mL",
    bandSource: "Ventana terapéutica clínica habitual: 5–20 ng/mL."
  },
  metf: {
    name: "Metformina", ka: 1.9, ke: 0.35, tEnd: 6, lagH: 0.75,
    band: [0.77, 3.10], unit: "μM (sudor, ilustrativo)",
    bandSource: "Rango seguro y terapéutico en sudor según Zheng et al., 2026."
  }
};

function bateman(t, ka, ke) {
  if (t < 0) return 0;
  return Math.exp(-ke * t) - Math.exp(-ka * t);
}

function drawPkSvg() {
  const drugKey = document.getElementById("pkDrug").value;
  const dose = parseFloat(document.getElementById("doseSlider").value);
  const p = PK_PARAMS[drugKey];
  const svg = document.getElementById("pkSvg");
  const W = 440, H = 240, padL = 42, padR = 16, padT = 20, padB = 34;

  // Escalar la curva para que el pico ronde el centro de la banda terapéutica
  const tPeak = Math.log(p.ka / p.ke) / (p.ka - p.ke);
  const rawPeak = bateman(tPeak, p.ka, p.ke);
  const bandMid = (p.band[0] + p.band[1]) / 2;
  const scale = (bandMid / rawPeak) * dose;

  const yMax = Math.max(scale * rawPeak * 1.4, p.band[1] * 1.3);

  const xToPx = (t) => padL + (t / p.tEnd) * (W - padL - padR);
  const yToPx = (c) => (H - padB) - (c / yMax) * (H - padT - padB);

  let plasmaPath = "", matrixPath = "";
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (p.tEnd * i) / steps;
    const cPlasma = scale * bateman(t, p.ka, p.ke);
    const cMatrix = scale * bateman(t - p.lagH, p.ka, p.ke);
    const pxP = xToPx(t), pyP = yToPx(cPlasma);
    const pxM = xToPx(t), pyM = yToPx(Math.max(cMatrix, 0));
    plasmaPath += (i === 0 ? "M" : "L") + pxP.toFixed(1) + "," + pyP.toFixed(1) + " ";
    matrixPath += (i === 0 ? "M" : "L") + pxM.toFixed(1) + "," + pyM.toFixed(1) + " ";
  }

  const bandTopPx = yToPx(p.band[1]);
  const bandBotPx = yToPx(p.band[0]);

  svg.innerHTML = `
    <rect x="${padL}" y="${bandTopPx.toFixed(1)}" width="${W - padL - padR}" height="${(bandBotPx - bandTopPx).toFixed(1)}"
      fill="rgba(234,243,242,0.08)"/>
    <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="var(--border)" stroke-width="1"/>
    <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${H - padB}" stroke="var(--border)" stroke-width="1"/>
    <path d="${matrixPath}" fill="none" stroke="var(--teal)" stroke-width="2" stroke-dasharray="5 4"/>
    <path d="${plasmaPath}" fill="none" stroke="var(--amber)" stroke-width="2.4"/>
    <text x="${padL}" y="${H - 10}" fill="var(--text-muted)" font-size="9" font-family="IBM Plex Mono, monospace">0 h</text>
    <text x="${W - padR - 24}" y="${H - 10}" fill="var(--text-muted)" font-size="9" font-family="IBM Plex Mono, monospace">${p.tEnd} h</text>
    <text x="6" y="${padT + 4}" fill="var(--text-muted)" font-size="8" font-family="IBM Plex Mono, monospace">${p.unit}</text>
  `;

  document.getElementById("pkDisclaimer").textContent =
    `${p.bandSource} Modelo monocompartimental con parámetros ilustrativos (no son valores farmacocinéticos validados de ${p.name.toLowerCase()}).`;
}

function setupPkSim() {
  drawPkSvg();
  document.getElementById("pkDrug").addEventListener("change", drawPkSvg);
  document.getElementById("doseSlider").addEventListener("input", drawPkSvg);
}

document.addEventListener("DOMContentLoaded", () => {
  renderParams();
  setupTabs();
  setupCalc();
  setupCalSim();
  setupPkSim();
});