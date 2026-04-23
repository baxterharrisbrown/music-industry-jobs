// app.js — Wires UI to data layer
import { companies, discoveryLinks } from "./companies.js";
import { normalizeGreenhouseJob, normalizeLeverJob, finalizeJob } from "./normalizer.js";
import { applyFilters, sortByDate, getActiveCompanies } from "./filters.js";
import { renderJobs, renderSkeletons, renderError, renderCount, renderTier2, populateDropdown } from "./render.js";

// ─── State ────────────────────────────────────────────────────────
let allJobs = [];
let filterState = {
  search: "",
  functions: [],
  companies: [],
  seniority: null,
  locationText: "",
  remoteOnly: false,
  mbaOnly: true
};

// ─── DOM refs ─────────────────────────────────────────────────────
const grid = document.getElementById("jobs-grid");
const statusLine = document.getElementById("status-line");
const tier2Grid = document.getElementById("tier2-grid");
const searchInput = document.getElementById("filter-search");
const functionSelect = document.getElementById("filter-function");
const companySelect = document.getElementById("filter-company");
const locationInput = document.getElementById("filter-location");
const remoteCheckbox = document.getElementById("filter-remote");
const mbaToggle = document.getElementById("mba-toggle");
const seniorityPills = document.querySelectorAll(".seniority-pill");

// ─── Initialize ───────────────────────────────────────────────────
async function init() {
  renderSkeletons(grid);
  renderTier2Section();
  bindFilters();

  try {
    allJobs = await loadJobs();
    populateCompanyDropdown();
    applyAndRender();
  } catch (err) {
    console.error("Failed to load jobs:", err);
    renderError(grid, () => init());
    statusLine.textContent = "Unable to load jobs.";
  }
}

// ─── Data Loading (two-layer cache) ──────────────────────────────
async function loadJobs() {
  // Try jobs-cache.json first (static file from GitHub Actions)
  try {
    const resp = await fetch("public/jobs-cache.json");
    if (resp.ok) {
      const data = await resp.json();
      if (data.jobs && data.jobs.length > 0) {
        // Cache in localStorage
        try {
          localStorage.setItem("jobs_cache", JSON.stringify(data));
          localStorage.setItem("jobs_cache_ts", new Date().toISOString());
        } catch (e) { /* localStorage full or disabled */ }
        return data.jobs;
      }
    }
  } catch (e) {
    console.warn("jobs-cache.json not available, trying localStorage...");
  }

  // Try localStorage
  try {
    const cached = localStorage.getItem("jobs_cache");
    const ts = localStorage.getItem("jobs_cache_ts");
    if (cached && ts) {
      const age = Date.now() - new Date(ts).getTime();
      // Use cache if less than 24 hours old
      if (age < 24 * 60 * 60 * 1000) {
        const data = JSON.parse(cached);
        if (data.jobs && data.jobs.length > 0) return data.jobs;
      }
    }
  } catch (e) { /* parse error */ }

  // Fall back to live fetch
  return await fetchLive();
}

async function fetchLive() {
  const tier1 = companies.filter(c => c.tier === 1);
  const results = await Promise.allSettled(tier1.map(c => fetchCompany(c)));
  const jobs = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      jobs.push(...result.value);
    }
  }

  if (jobs.length > 0) {
    try {
      localStorage.setItem("jobs_cache", JSON.stringify({ jobs, generated_at: new Date().toISOString() }));
      localStorage.setItem("jobs_cache_ts", new Date().toISOString());
    } catch (e) { /* ignore */ }
  }

  return jobs;
}

async function fetchCompany(company) {
  try {
    if (company.ats === "greenhouse") {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company.board_token}/jobs?content=true`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!data.jobs) return null;
      return data.jobs.map(j => finalizeJob(normalizeGreenhouseJob(j, company)));
    }

    if (company.ats === "lever") {
      const url = `https://api.lever.co/v0/postings/${company.board_token}?mode=json`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (!Array.isArray(data)) return null;
      return data.map(j => finalizeJob(normalizeLeverJob(j, company)));
    }
  } catch (err) {
    console.warn(`Failed to fetch ${company.name}:`, err);
    return null;
  }
}

// ─── Filtering & Rendering ────────────────────────────────────────
function applyAndRender() {
  const filtered = sortByDate(applyFilters(allJobs, filterState));
  const companyCount = new Set(filtered.map(j => j.company_id)).size;
  renderJobs(grid, filtered);
  renderCount(statusLine, filtered.length, allJobs.length, companyCount);
}

function populateCompanyDropdown() {
  const active = getActiveCompanies(allJobs);
  populateDropdown(companySelect, [{ id: "", name: "All Companies" }, ...active]);
}

// ─── Filter Bindings ──────────────────────────────────────────────
function bindFilters() {
  let searchTimer;

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filterState.search = searchInput.value;
      applyAndRender();
    }, 300);
  });

  functionSelect.addEventListener("change", () => {
    const val = functionSelect.value;
    filterState.functions = val ? [val] : [];
    applyAndRender();
  });

  companySelect.addEventListener("change", () => {
    const val = companySelect.value;
    filterState.companies = val ? [val] : [];
    applyAndRender();
  });

  locationInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filterState.locationText = locationInput.value;
      applyAndRender();
    }, 300);
  });

  remoteCheckbox.addEventListener("change", () => {
    filterState.remoteOnly = remoteCheckbox.checked;
    applyAndRender();
  });

  // MBA toggle
  mbaToggle.addEventListener("click", toggleMba);
  mbaToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMba();
    }
  });

  // Seniority pills
  for (const pill of seniorityPills) {
    pill.addEventListener("click", () => {
      for (const p of seniorityPills) p.classList.remove("seniority-pill--active");
      pill.classList.add("seniority-pill--active");
      const val = pill.dataset.seniority;
      filterState.seniority = val || null;
      applyAndRender();
    });
  }
}

function toggleMba() {
  filterState.mbaOnly = !filterState.mbaOnly;
  mbaToggle.classList.toggle("mba-toggle--active", filterState.mbaOnly);
  mbaToggle.setAttribute("aria-checked", String(filterState.mbaOnly));
  const label = mbaToggle.querySelector(".mba-toggle__label");
  label.textContent = filterState.mbaOnly ? "Grad-relevant only" : "Showing all roles";
  applyAndRender();
}

// ─── Tier 2 Section ───────────────────────────────────────────────
function renderTier2Section() {
  const tier2 = companies.filter(c => c.tier === 2);
  renderTier2(tier2Grid, tier2, discoveryLinks);
}

// ─── Go ───────────────────────────────────────────────────────────
init();
