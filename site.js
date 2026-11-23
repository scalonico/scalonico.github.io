// Footer year, folded lists for find-in-page and printing, and the home page plot.

const yearNode = document.getElementById("year");
if (yearNode) yearNode.textContent = new Date().getFullYear();

const openFolds = () => document.querySelectorAll("details").forEach((d) => (d.open = true));
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") openFolds();
});
window.addEventListener("beforeprint", openFolds);

// >>> estimator
// Sharp RD estimate at cutoff 0 with a manual bandwidth, following the steps of
// rdrobust(y, x, h = h): local linear point estimate (p = 1), local quadratic bias
// correction (q = 2) with the bias bandwidth equal to h (rho = 1), triangular kernel,
// and nearest-neighbour variance with three matches. Returns null when a side has too
// few observations inside the bandwidth.
function rdRobust(xs, ys, h) {
  const inv = (A) => {
    // Gauss-Jordan inverse of a small square matrix.
    const k = A.length;
    const M = A.map((row, i) => [...row, ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < k; c++) {
      let piv = c;
      for (let r = c + 1; r < k; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]];
      const d = M[c][c];
      for (let j = 0; j < 2 * k; j++) M[c][j] /= d;
      for (let r = 0; r < k; r++) {
        if (r === c) continue;
        const f = M[r][c];
        for (let j = 0; j < 2 * k; j++) M[r][j] -= f * M[c][j];
      }
    }
    return M.map((row) => row.slice(k));
  };

  // Nearest-neighbour residuals on data sorted by x (rdrobust_res with vce = "nn").
  const nnResiduals = (x, y, matches) => {
    const n = x.length;
    const eps = Math.sqrt(Number.EPSILON);
    const res = new Array(n);
    for (let pos = 0; pos < n; pos++) {
      let l = 0;
      let r = 0;
      while (l + r < Math.min(matches, n - 1)) {
        if (pos - l - 1 < 0) r += 1;
        else if (pos + r + 1 > n - 1) l += 1;
        else {
          const dl = x[pos] - x[pos - l - 1];
          const dr = x[pos + r + 1] - x[pos];
          const tol = Math.max(dl, dr) * eps;
          if (dl - dr > tol) r += 1;
          else if (dr - dl > tol) l += 1;
          else {
            r += 1;
            l += 1;
          }
        }
      }
      let sum = 0;
      for (let i = pos - l; i <= pos + r; i++) sum += y[i];
      const J = l + r;
      res[pos] = Math.sqrt(J / (J + 1)) * (y[pos] - (sum - y[pos]) / J);
    }
    return res;
  };

  const oneSide = (keep) => {
    const idx = [];
    for (let i = 0; i < xs.length; i++) if (keep(xs[i]) && Math.abs(xs[i]) < h) idx.push(i);
    idx.sort((a, b) => xs[a] - xs[b]);
    const x = idx.map((i) => xs[i]);
    const y = idx.map((i) => ys[i]);
    const n = x.length;
    if (n < 5) return null;

    const w = x.map((v) => (1 - Math.abs(v / h)) / h);
    const Gq = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const L = [0, 0];
    for (let i = 0; i < n; i++) {
      const r = [1, x[i], x[i] * x[i]];
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) Gq[a][b] += w[i] * r[a] * r[b];
      const u2 = (x[i] / h) ** 2;
      L[0] += w[i] * u2;
      L[1] += w[i] * x[i] * u2;
    }
    const invGq = inv(Gq);
    const invGp = inv([[Gq[0][0], Gq[0][1]], [Gq[1][0], Gq[1][1]]]);

    // Rows of R_p * W_h and of Q_q (the bias-corrected weights).
    const P = new Array(n);
    const Q = new Array(n);
    for (let i = 0; i < n; i++) {
      const a = w[i] * (invGq[2][0] + invGq[2][1] * x[i] + invGq[2][2] * x[i] * x[i]);
      P[i] = [w[i], w[i] * x[i]];
      Q[i] = [P[i][0] - h * h * a * L[0], P[i][1] - h * h * a * L[1]];
    }

    const res = nnResiduals(x, y, 3);
    const sumP = [0, 0];
    const sumQ = [0, 0];
    const Mcl = [[0, 0], [0, 0]];
    const Mrb = [[0, 0], [0, 0]];
    for (let i = 0; i < n; i++) {
      const e2 = res[i] * res[i];
      for (let a = 0; a < 2; a++) {
        sumP[a] += P[i][a] * y[i];
        sumQ[a] += Q[i][a] * y[i];
        for (let b = 0; b < 2; b++) {
          Mcl[a][b] += e2 * P[i][a] * P[i][b];
          Mrb[a][b] += e2 * Q[i][a] * Q[i][b];
        }
      }
    }
    const row0 = invGp[0];
    const quad = (M) => row0[0] * (M[0][0] * row0[0] + M[0][1] * row0[1]) + row0[1] * (M[1][0] * row0[0] + M[1][1] * row0[1]);
    return {
      n,
      intercept: row0[0] * sumP[0] + row0[1] * sumP[1],
      slope: invGp[1][0] * sumP[0] + invGp[1][1] * sumP[1],
      interceptBc: row0[0] * sumQ[0] + row0[1] * sumQ[1],
      varCl: quad(Mcl),
      varRb: quad(Mrb),
    };
  };

  const left = oneSide((v) => v < 0);
  const right = oneSide((v) => v >= 0);
  if (!left || !right) return null;
  const z = 1.959963984540054;
  const tauCl = right.intercept - left.intercept;
  const tauBc = right.interceptBc - left.interceptBc;
  const seCl = Math.sqrt(left.varCl + right.varCl);
  const seRb = Math.sqrt(left.varRb + right.varRb);
  return { left, right, tauCl, tauBc, seCl, seRb, ciRb: [tauBc - z * seRb, tauBc + z * seRb], ciCl: [tauCl - z * seCl, tauCl + z * seCl] };
}
// <<< estimator

// ---------- Regression discontinuity plot (home page) ----------
// Simulated data only. Design: Model 1 in Calonico, Cattaneo and Titiunik (2014),
// X = 2 * Beta(2, 4) - 1, with the design's noise sd (0.1295) and jump (0.04) as the
// starting values. The controls change the jump, the noise, the sample size, the
// bandwidth of the local linear estimate, the order of the global polynomial fit, and
// whether the raw observations are drawn.

(function () {
  const svg = document.getElementById("rd-plot");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const BINS_LEFT = 20;
  const BINS_RIGHT = 14;
  const state = { seed: 7, jump: 0.04, sigma: 0.1295, n: 1000, h: 0.2, order: 4, raw: true };

  const byId = (id) => document.getElementById(id);
  const estimateNode = byId("rd-est");
  const trueNode = byId("rd-true");
  const ciNode = byId("rd-ci");
  const coverNode = byId("rd-cover");
  const windowNode = byId("rd-window");
  const callNode = byId("rd-call");
  const fmt = (v) => v.toFixed(2).replace("-", "−");

  const mu = (x) =>
    x < 0
      ? 0.48 + 1.27 * x + 7.18 * x ** 2 + 20.21 * x ** 3 + 21.54 * x ** 4 + 7.33 * x ** 5
      : 0.48 + state.jump + 0.84 * x - 3.0 * x ** 2 + 7.99 * x ** 3 - 9.01 * x ** 4 + 3.56 * x ** 5;

  function rng(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // The random draws depend only on the seed, so moving a control changes the
  // picture without reshuffling the points.
  function simulate() {
    const u = rng(state.seed);
    const points = [];
    for (let i = 0; i < state.n; i++) {
      // Beta(2, 4) is the second smallest of five uniforms.
      const five = [u(), u(), u(), u(), u()].sort((a, b) => a - b);
      const x = 2 * five[1] - 1;
      const z = Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
      points.push({ x, y: mu(x) + state.sigma * z });
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
    const m = { l: 40, r: 10, t: 14, b: 40 };

    const points = simulate();
    const left = points.filter((p) => p.x < 0);
    const right = points.filter((p) => p.x >= 0);
    const dots = binMeans(left, -1, 0, BINS_LEFT).concat(binMeans(right, 0, 1, BINS_RIGHT));

    // Vertical range: wide enough for what is drawn, rounded to quarters.
    const shown = state.raw ? points.map((p) => p.y).sort((a, b) => a - b) : dots.map((d) => d.y).sort((a, b) => a - b);
    const cut = state.raw ? Math.floor(shown.length * 0.005) : 0;
    const lo = Math.min(0, shown[cut]);
    const hi = Math.max(1, shown[shown.length - 1 - cut]);
    const yMin = Math.floor((lo - 0.02) * 4) / 4;
    const yMax = Math.ceil((hi + 0.05) * 4) / 4;

    const sx = (x) => m.l + ((x + 1) / 2) * (W - m.l - m.r);
    const sy = (y) => m.t + (1 - (y - yMin) / (yMax - yMin)) * (H - m.t - m.b);
    const clampY = (y) => Math.min(yMax, Math.max(yMin, y));

    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.replaceChildren();

    // The bandwidth window around the cutoff
    el("rect", { class: "rd-window", x: sx(-state.h), y: m.t, width: sx(state.h) - sx(-state.h), height: sy(yMin) - m.t });

    // Raw observations
    if (state.raw) {
      for (const p of points) {
        if (p.y < yMin || p.y > yMax) continue;
        el("circle", { class: "rd-raw", cx: sx(p.x).toFixed(1), cy: sy(p.y).toFixed(1), r: 1.4 });
      }
    }

    // Axes and ticks
    el("line", { class: "rd-axis", x1: m.l, x2: W - m.r, y1: sy(yMin), y2: sy(yMin) });
    el("line", { class: "rd-axis", x1: m.l, x2: m.l, y1: m.t, y2: sy(yMin) });
    for (const x of [-1, -0.5, 0, 0.5, 1]) {
      el("line", { class: "rd-axis", x1: sx(x), x2: sx(x), y1: sy(yMin), y2: sy(yMin) + 4 });
      el(
        "text",
        { class: "rd-tick", x: sx(x), y: sy(yMin) + 18, "text-anchor": "middle" },
        String(x).replace("-", "−")
      );
    }
    const step = yMax - yMin > 2 ? 1 : 0.5;
    for (let y = Math.ceil(yMin / step) * step; y <= yMax + 1e-9; y += step) {
      el("line", { class: "rd-axis", x1: m.l - 4, x2: m.l, y1: sy(y), y2: sy(y) });
      el("text", { class: "rd-tick", x: m.l - 8, y: sy(y) + 4, "text-anchor": "end" }, String(+y.toFixed(2)).replace("-", "−"));
    }
    el("text", { class: "rd-tick", x: W - m.r, y: H - 4, "text-anchor": "end" }, "running variable");
    el("text", { class: "rd-tick", x: m.l + 8, y: m.t + 8 }, "outcome");

    // Cutoff
    el("line", { class: "rd-cut", x1: sx(0), x2: sx(0), y1: m.t, y2: sy(yMin) });
    el("text", { class: "rd-cut-label", x: sx(0) + 7, y: m.t + 8 }, "cutoff");

    // Binned means
    const radius = W < 400 ? 2.6 : 3.2;
    for (const d of dots) el("circle", { class: "rd-dot", cx: sx(d.x), cy: sy(clampY(d.y)), r: radius });

    // Global polynomial fit on each side (the usual RD plot), drawn thin
    for (const [side, from, to] of [
      [left, Math.min(...left.map((p) => p.x)), 0],
      [right, 0, Math.max(...right.map((p) => p.x))],
    ]) {
      const fit = polyfit(side, state.order);
      let path = "";
      for (let i = 0; i <= 80; i++) {
        const x = from + ((to - from) * i) / 80;
        path += `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(clampY(fit(x))).toFixed(1)}`;
      }
      el("path", { class: "rd-global", d: path });
    }

    // Local linear fit inside the bandwidth, and the estimate with its robust interval
    const rd = rdRobust(points.map((p) => p.x), points.map((p) => p.y), state.h);
    if (rd) {
      for (const [fit, from, to] of [
        [rd.left, -state.h, 0],
        [rd.right, 0, state.h],
      ]) {
        el("line", {
          class: "rd-fit",
          x1: sx(from), y1: sy(clampY(fit.intercept + fit.slope * from)),
          x2: sx(to), y2: sy(clampY(fit.intercept + fit.slope * to)),
        });
      }
    }
    if (estimateNode) estimateNode.textContent = rd ? fmt(rd.tauCl) : "n/a";
    if (trueNode) trueNode.textContent = state.jump.toFixed(2);
    if (ciNode) ciNode.textContent = rd ? `[${fmt(rd.ciRb[0])}, ${fmt(rd.ciRb[1])}]` : "n/a";
    if (coverNode) {
      const covers = rd && rd.ciRb[0] <= state.jump && state.jump <= rd.ciRb[1];
      coverNode.textContent = !rd ? "too few observations inside the bandwidth" : covers ? "covers the true jump" : "misses the true jump";
      coverNode.dataset.covers = rd ? String(covers) : "";
    }
    if (windowNode) windowNode.textContent = rd ? `${rd.left.n} observations to the left and ${rd.right.n} to the right` : "";
    if (callNode) callNode.textContent = `rdrobust(y, x, h = ${state.h.toFixed(2)})`;
  }

  // Controls
  function bind(id, key, read, show) {
    const input = byId(id);
    if (!input) return;
    const out = byId(id + "-out");
    const update = () => {
      state[key] = read(input);
      if (out) out.textContent = show ? show(state[key]) : String(state[key]);
      draw();
    };
    input.addEventListener("input", update);
    input.addEventListener("change", update);
  }
  bind("rd-jump", "jump", (i) => Number(i.value), (v) => v.toFixed(2));
  bind("rd-noise", "sigma", (i) => Number(i.value), (v) => v.toFixed(2));
  bind("rd-n", "n", (i) => Number(i.value));
  bind("rd-h", "h", (i) => Number(i.value), (v) => v.toFixed(2));
  bind("rd-order", "order", (i) => Number(i.value));
  bind("rd-raw", "raw", (i) => i.checked);

  byId("rd-resample")?.addEventListener("click", () => {
    state.seed += 1;
    draw();
  });

  draw();

  let lastWidth = svg.clientWidth;
  new ResizeObserver(() => {
    if (Math.abs(svg.clientWidth - lastWidth) < 2) return;
    lastWidth = svg.clientWidth;
    draw();
  }).observe(svg);
})();
