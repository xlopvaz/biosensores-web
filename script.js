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

document.addEventListener("DOMContentLoaded", () => {
  renderParams();
  setupTabs();
  setupCalc();
});
