"use strict";

const state = { jobs: [], query: "", activeTags: new Set() };

function agoFrom(iso) {
  if (!iso) return "recently";
  const then = new Date(iso.replace(" ", "T")).getTime();
  if (Number.isNaN(then)) return "recently";
  const secs = Math.max(0, (Date.now() - then) / 1000);
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  const days = Math.floor(secs / 86400);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function allTags(jobs) {
  const t = new Set();
  jobs.forEach((j) => (j.tags || []).forEach((x) => t.add(x)));
  return [...t].sort();
}

function filtered() {
  const q = state.query.trim().toLowerCase();
  return state.jobs.filter((j) => {
    if (state.activeTags.size && !(j.tags || []).some((t) => state.activeTags.has(t))) return false;
    if (!q) return true;
    return (
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      (j.location || "").toLowerCase().includes(q)
    );
  });
}

function render() {
  const list = document.getElementById("list");
  const jobs = filtered();
  if (!jobs.length) {
    list.innerHTML = `<div class="empty">No matching roles.</div>`;
    return;
  }
  list.innerHTML = jobs
    .map(
      (j) => `
      <a class="card" href="${escapeHtml(j.url)}" target="_blank" rel="noreferrer">
        <div class="title">${escapeHtml(j.title)}</div>
        <div class="row">
          <span class="co">${escapeHtml(j.company)}</span>
          <span>${escapeHtml(j.location || "—")}</span>
          ${(j.tags || []).map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join("")}
          <span class="ago">${agoFrom(j.posted)}</span>
        </div>
      </a>`
    )
    .join("");
}

function renderTags() {
  const box = document.getElementById("tags");
  box.innerHTML = "";
  allTags(state.jobs).forEach((tag) => {
    const el = document.createElement("span");
    el.className = "tag";
    el.textContent = tag;
    el.onclick = () => {
      if (state.activeTags.has(tag)) state.activeTags.delete(tag);
      else state.activeTags.add(tag);
      el.classList.toggle("on");
      render();
    };
    box.appendChild(el);
  });
}

async function load() {
  const meta = document.getElementById("meta");
  try {
    const res = await fetch("./jobs.json", { cache: "no-store" });
    const data = await res.json();
    state.jobs = data.jobs || [];
    const when = data.generated_at ? agoFrom(data.generated_at) : "recently";
    meta.textContent = `${data.count ?? state.jobs.length} openings · updated ${when}`;
    renderTags();
    render();
  } catch (e) {
    meta.textContent = "Could not load jobs.json — run `python3 jobfinder.py --export`.";
  }
}

document.getElementById("search").addEventListener("input", (e) => {
  state.query = e.target.value;
  render();
});

load();
