// Footer year, folded lists for find-in-page and printing, and the home page plot.

const yearNode = document.getElementById("year");
if (yearNode) yearNode.textContent = new Date().getFullYear();

const openFolds = () => document.querySelectorAll("details").forEach((d) => (d.open = true));
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") openFolds();
});
window.addEventListener("beforeprint", openFolds);

// ---------- Regression discontinuity plot (home page) ----------
// Simulated data only. Design: Model 1 in Calonico, Cattaneo and Titiunik (2014),
// X = 2 * Beta(2, 4) - 1, noise sd 0.1295, true jump at the cutoff 0.04.

(function () {
  const svg = document.getElementById("rd-plot");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const N = 1000;
  const ORDER = 4;
  const BINS_LEFT = 20;
  const BINS_RIGHT = 14;
  const Y_MIN = 0;
  const Y_MAX = 1.05;
  let seed = 7;

  const mu = (x) =>
    x < 0
      ? 0.48 + 1.27 * x + 7.18 * x ** 2 + 20.21 * x ** 3 + 21.54 * x ** 4 + 7.33 * x ** 5
      : 0.52 + 0.84 * x - 3.0 * x ** 2 + 7.99 * x ** 3 - 9.01 * x ** 4 + 3.56 * x ** 5;

  function rng(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function simulate(s) {
    const u = rng(s);
    const points = [];
    for (let i = 0; i < N; i++) {
      // Beta(2, 4) is the second smallest of five uniforms.
      const five = [u(), u(), u(), u(), u()].sort((a, b) => a - b);
      const x = 2 * five[1] - 1;
      const z = Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
      points.push({ x, y: mu(x) + 0.1295 * z });
    }
    return points;
  }

  // Least-squares polynomial fit by Gaussian elimination with partial pivoting.
  function polyfit(points, order) {
    const k = order + 1;
    const A = Array.from({ length: k }, () => new Array(k + 1).fill(0));
    for (const { x, y } of points) {
      const pow = [1];
      for (let j = 1; j < 2 * k - 1; j++) pow.push(pow[j - 1] * x);
      for (let r = 0; r < k; r++) {
        for (let c = 0; c < k; c++) A[r][c] += pow[r + c];
        A[r][k] += pow[r] * y;
      }
    }
    for (let c = 0; c < k; c++) {
      let p = c;
      for (let r = c + 1; r < k; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < k; r++) {
        if (r === c) continue;
        const f = A[r][c] / A[c][c];
        for (let j = c; j <= k; j++) A[r][j] -= f * A[c][j];
      }
    }
    const beta = A.map((row, i) => row[k] / row[i]);
    return (x) => beta.reduceRight((acc, b) => acc * x + b, 0);
  }

  function binMeans(points, lo, hi, bins) {
    const sum = new Array(bins).fill(0);
    const sumX = new Array(bins).fill(0);
    const count = new Array(bins).fill(0);
    for (const { x, y } of points) {
      const b = Math.min(bins - 1, Math.floor(((x - lo) / (hi - lo)) * bins));
      sum[b] += y;
      sumX[b] += x;
      count[b] += 1;
    }
    const out = [];
    for (let b = 0; b < bins; b++) {
      if (count[b] >= 2) out.push({ x: sumX[b] / count[b], y: sum[b] / count[b] });
    }
    return out;
  }

  function el(name, attrs, text) {
    const node = document.createElementNS(NS, name);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    if (text !== undefined) node.textContent = text;
    svg.appendChild(node);
    return node;
  }

  function draw() {
    const W = Math.max(280, Math.round(svg.clientWidth || 520));
    const H = Math.round(Math.min(340, Math.max(220, W * 0.56)));
    const m = { l: 34, r: 10, t: 14, b: 40 };
    const sx = (x) => m.l + ((x + 1) / 2) * (W - m.l - m.r);
    const sy = (y) => m.t + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - m.t - m.b);
    const clampY = (y) => Math.min(Y_MAX, Math.max(Y_MIN, y));

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.replaceChildren();

    const points = simulate(seed);
    const left = points.filter((p) => p.x < 0);
    const right = points.filter((p) => p.x >= 0);

    // Axes and ticks
    el("line", { class: "rd-axis", x1: m.l, x2: W - m.r, y1: sy(Y_MIN), y2: sy(Y_MIN) });
    el("line", { class: "rd-axis", x1: m.l, x2: m.l, y1: m.t, y2: sy(Y_MIN) });
    for (const x of [-1, -0.5, 0, 0.5, 1]) {
      el("line", { class: "rd-axis", x1: sx(x), x2: sx(x), y1: sy(Y_MIN), y2: sy(Y_MIN) + 4 });
      el(
        "text",
        { class: "rd-tick", x: sx(x), y: sy(Y_MIN) + 18, "text-anchor": "middle" },
        String(x).replace("-", "−")
      );
    }
    for (const y of [0, 0.5, 1]) {
      el("line", { class: "rd-axis", x1: m.l - 4, x2: m.l, y1: sy(y), y2: sy(y) });
      el("text", { class: "rd-tick", x: m.l - 8, y: sy(y) + 4, "text-anchor": "end" }, String(y));
    }
    el("text", { class: "rd-tick", x: W - m.r, y: H - 4, "text-anchor": "end" }, "running variable");
    el("text", { class: "rd-tick", x: m.l + 8, y: m.t + 8 }, "outcome");

    // Cutoff
    el("line", { class: "rd-cut", x1: sx(0), x2: sx(0), y1: m.t, y2: sy(Y_MIN) });
    el("text", { class: "rd-cut-label", x: sx(0) + 7, y: m.t + 8 }, "cutoff");

    // Binned means
    const dots = binMeans(left, -1, 0, BINS_LEFT).concat(binMeans(right, 0, 1, BINS_RIGHT));
    const radius = W < 400 ? 2.6 : 3.2;
    for (const d of dots) el("circle", { class: "rd-dot", cx: sx(d.x), cy: sy(clampY(d.y)), r: radius });

    // Polynomial fit on each side, drawn over the range of the data
    for (const [side, from, to] of [
      [left, Math.min(...left.map((p) => p.x)), 0],
      [right, 0, Math.max(...right.map((p) => p.x))],
    ]) {
      const fit = polyfit(side, ORDER);
      let path = "";
      for (let i = 0; i <= 80; i++) {
        const x = from + ((to - from) * i) / 80;
        path += `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(clampY(fit(x))).toFixed(1)}`;
      }
      el("path", { class: "rd-fit", d: path });
    }
  }

  draw();

  let lastWidth = svg.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(svg.clientWidth - lastWidth) < 2) return;
    lastWidth = svg.clientWidth;
    draw();
  }).observe(svg);

  document.getElementById("rd-resample")?.addEventListener("click", () => {
    seed += 1;
    draw();
  });
})();
