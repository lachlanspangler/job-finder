"use strict";

const TAG_COLORS = { ai: "#b08cff", quant: "#43e08a", fintech: "#34d3ee", tech: "#fbbf3d" };
const state = { jobs: [], query: "", tags: new Set(), sort: "new", freshOnly: false };

function parseTime(iso) {
  if (!iso) return NaN;
  return new Date(iso.replace(" ", "T")).getTime();
}
function agoFrom(iso) {
  const t = parseTime(iso);
  if (Number.isNaN(t)) return { text: "recently", cls: "old" };
  const secs = Math.max(0, (Date.now() - t) / 1000);
  const days = secs / 86400;
  let text;
  if (secs < 3600) text = `${Math.floor(secs / 60)}m ago`;
  else if (secs < 86400) text = `${Math.floor(secs / 3600)}h ago`;
  else if (days < 30) text = `${Math.floor(days)}d ago`;
  else if (days < 365) text = `${Math.floor(days / 30)}mo ago`;
  else text = `${Math.floor(days / 365)}y ago`;
  const cls = days < 1 ? "fresh" : days < 7 ? "week" : "old";
  return { text, cls };
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function edgeColor(tags) {
  for (const t of tags || []) if (TAG_COLORS[t]) return TAG_COLORS[t];
  return "#7c8cff";
}

function animateCount(el, to) {
  const from = 0, dur = 700, start = performance.now();
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function computeStats(jobs) {
  const companies = new Set(jobs.map((j) => j.company));
  let fresh = 0, week = 0;
  jobs.forEach((j) => {
    const d = (Date.now() - parseTime(j.posted)) / 86400000;
    if (d < 1) fresh++;
    if (d < 7) week++;
  });
  return { total: jobs.length, companies: companies.size, fresh, week };
}
function renderStats(jobs) {
  const s = computeStats(jobs);
  document.querySelectorAll("[data-stat]").forEach((el) => animateCount(el, s[el.dataset.stat] || 0));
}

function allTags(jobs) {
  const t = new Set();
  jobs.forEach((j) => (j.tags || []).forEach((x) => t.add(x)));
  return [...t].sort();
}
function renderTags() {
  const box = document.getElementById("tags");
  box.innerHTML = "";
  allTags(state.jobs).forEach((tag) => {
    const el = document.createElement("span");
    el.className = "tag";
    el.dataset.tag = tag;
    el.textContent = tag;
    el.onclick = () => {
      state.tags.has(tag) ? state.tags.delete(tag) : state.tags.add(tag);
      el.classList.toggle("on");
      render();
    };
    box.appendChild(el);
  });
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  let jobs = state.jobs.filter((j) => {
    if (state.tags.size && !(j.tags || []).some((t) => state.tags.has(t))) return false;
    if (state.freshOnly && (Date.now() - parseTime(j.posted)) / 86400000 >= 1) return false;
    if (!q) return true;
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.location || "").toLowerCase().includes(q)
    );
  });
  if (state.sort === "company") jobs.sort((a, b) => a.company.localeCompare(b.company));
  else if (state.sort === "title") jobs.sort((a, b) => a.title.localeCompare(b.title));
  else jobs.sort((a, b) => (parseTime(b.posted) || 0) - (parseTime(a.posted) || 0));
  return jobs;
}

function render() {
  const list = document.getElementById("list");
  const jobs = filtered();
  if (!jobs.length) {
    list.innerHTML = `<div class="empty">No matching roles.</div>`;
    return;
  }
  list.innerHTML = jobs
    .map((j) => {
      const ago = agoFrom(j.posted);
      const edge = edgeColor(j.tags);
      const tags = (j.tags || [])
        .map((t) => `<span class="pill" style="color:${TAG_COLORS[t] || "#9aa4bd"}">${escapeHtml(t)}</span>`)
        .join("");
      return `
        <a class="card" style="--edge:${edge}" href="${escapeHtml(j.url)}" target="_blank" rel="noreferrer">
          <div class="title">${escapeHtml(j.title)}</div>
          <div class="co"><span class="cdot"></span>${escapeHtml(j.company)}</div>
          <div class="loc">${escapeHtml(j.location || "—")}</div>
          <div class="meta">
            ${tags}
            <span class="pill src">${escapeHtml(j.source || "")}</span>
            <span class="ago ${ago.cls}">${ago.text}</span>
          </div>
          <div class="apply">Apply →</div>
        </a>`;
    })
    .join("");
}

async function load() {
  const live = document.getElementById("live");
  try {
    const res = await fetch("./jobs.json", { cache: "no-store" });
    const data = await res.json();
    state.jobs = data.jobs || [];
    const when = data.generated_at ? agoFrom(data.generated_at).text : "recently";
    live.innerHTML = `<span class="dot"></span> updated ${when}`;
    renderStats(state.jobs);
    renderTags();
    render();
  } catch (e) {
    live.innerHTML = `<span class="dot" style="background:#ff6b6b"></span> couldn't load jobs.json`;
  }
}

document.getElementById("search").addEventListener("input", (e) => { state.query = e.target.value; render(); });
document.getElementById("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
document.getElementById("fresh-only").addEventListener("change", (e) => { state.freshOnly = e.target.checked; render(); });

load();
