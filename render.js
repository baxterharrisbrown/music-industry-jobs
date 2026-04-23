// render.js — DOM rendering only, no data logic
// All strings are sanitized before DOM insertion (no innerHTML with untrusted data)

import { categoryColors } from "./companies.js";

/**
 * Sanitize a string for safe text insertion
 */
function sanitize(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Format relative time from ISO date string
 */
function relativeTime(isoDate) {
  if (!isoDate) return "Date unknown";
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Format salary display
 */
function formatSalary(job) {
  if (job.salary_min != null && job.salary_max != null) {
    return `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`;
  }
  if (job.salary_min != null) {
    return `$${job.salary_min.toLocaleString()}+`;
  }
  if (job.salary_text) {
    return sanitize(job.salary_text);
  }
  return null;
}

/**
 * Create a category badge element
 */
function createCategoryBadge(category) {
  const badge = document.createElement("span");
  badge.className = "badge badge--category";
  const colors = categoryColors[category];
  if (colors) {
    badge.style.backgroundColor = colors.bg;
    badge.style.color = colors.text;
  }
  badge.textContent = category;
  return badge;
}

/**
 * Create a function tag pill
 */
function createFunctionPill(tag) {
  const pill = document.createElement("span");
  pill.className = "badge badge--function";
  pill.textContent = tag;
  return pill;
}

/**
 * Render a single job card
 */
function renderJobCard(job) {
  const card = document.createElement("article");
  card.className = "job-card";
  card.setAttribute("data-job-id", job.id);

  // Header row: title + posted date
  const header = document.createElement("div");
  header.className = "job-card__header";

  const title = document.createElement("h3");
  title.className = "job-card__title";
  title.textContent = job.title;
  header.appendChild(title);

  const date = document.createElement("time");
  date.className = `job-card__date${!job.posted_at ? " job-card__date--muted" : ""}`;
  date.textContent = relativeTime(job.posted_at);
  if (job.posted_at) date.setAttribute("datetime", job.posted_at);
  header.appendChild(date);

  card.appendChild(header);

  // Company + category
  const meta = document.createElement("div");
  meta.className = "job-card__meta";

  const company = document.createElement("span");
  company.className = "job-card__company";
  company.textContent = job.company;
  meta.appendChild(company);

  meta.appendChild(createCategoryBadge(job.category));

  if (job.seniority) {
    const seniorityBadge = document.createElement("span");
    seniorityBadge.className = "badge badge--seniority";
    seniorityBadge.textContent = job.seniority;
    meta.appendChild(seniorityBadge);
  }

  card.appendChild(meta);

  // Location
  const locationRow = document.createElement("div");
  locationRow.className = "job-card__location";

  const locationIcon = document.createElement("span");
  locationIcon.className = "job-card__location-icon";
  locationIcon.textContent = "\u25CB"; // small circle
  locationRow.appendChild(locationIcon);

  const locationText = document.createElement("span");
  if (job.location) {
    locationText.textContent = job.location;
  } else {
    locationText.textContent = "Location not listed";
    locationText.className = "text-muted";
  }
  locationRow.appendChild(locationText);

  if (job.is_remote) {
    const remoteBadge = document.createElement("span");
    remoteBadge.className = "badge badge--remote";
    remoteBadge.textContent = "Remote";
    locationRow.appendChild(remoteBadge);
  }

  card.appendChild(locationRow);

  // Compensation
  const salaryRow = document.createElement("div");
  salaryRow.className = "job-card__salary";
  const salaryStr = formatSalary(job);
  if (salaryStr) {
    salaryRow.innerHTML = ""; // clear
    const salaryText = document.createElement("span");
    salaryText.className = "job-card__salary-value";
    salaryText.textContent = salaryStr;
    salaryRow.appendChild(salaryText);
  } else {
    const mutedSalary = document.createElement("span");
    mutedSalary.className = "text-muted";
    mutedSalary.textContent = "Compensation not listed";
    salaryRow.appendChild(mutedSalary);
  }
  card.appendChild(salaryRow);

  // Function tags
  if (job.functions && job.functions.length > 0) {
    const tags = document.createElement("div");
    tags.className = "job-card__tags";
    const displayTags = job.functions.slice(0, 3);
    for (const tag of displayTags) {
      tags.appendChild(createFunctionPill(tag));
    }
    card.appendChild(tags);
  }

  // Apply button
  const footer = document.createElement("div");
  footer.className = "job-card__footer";

  const applyBtn = document.createElement("a");
  applyBtn.className = "btn btn--primary";
  applyBtn.href = job.apply_url;
  applyBtn.target = "_blank";
  applyBtn.rel = "noopener noreferrer";
  applyBtn.textContent = "Apply";
  footer.appendChild(applyBtn);

  card.appendChild(footer);

  return card;
}

/**
 * Render skeleton loading cards
 */
export function renderSkeletons(container, count = 6) {
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const card = document.createElement("article");
    card.className = "job-card job-card--skeleton";
    card.innerHTML = `
      <div class="skeleton skeleton--title"></div>
      <div class="skeleton skeleton--text"></div>
      <div class="skeleton skeleton--text skeleton--short"></div>
      <div class="skeleton skeleton--tags"></div>
      <div class="skeleton skeleton--button"></div>
    `;
    container.appendChild(card);
  }
}

/**
 * Render the job grid
 */
export function renderJobs(container, jobs) {
  container.innerHTML = "";

  if (jobs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `
      <p class="empty-state__message">No roles match your current filters.</p>
      <p class="empty-state__hint">Try broadening your search or toggling off the grad filter.</p>
    `;
    container.appendChild(empty);
    return;
  }

  for (const job of jobs) {
    container.appendChild(renderJobCard(job));
  }
}

/**
 * Render error state
 */
export function renderError(container, onRetry) {
  container.innerHTML = "";
  const errorEl = document.createElement("div");
  errorEl.className = "empty-state";

  const msg = document.createElement("p");
  msg.className = "empty-state__message";
  msg.textContent = "Unable to load jobs right now.";
  errorEl.appendChild(msg);

  const retryBtn = document.createElement("button");
  retryBtn.className = "btn btn--primary";
  retryBtn.textContent = "Retry \u21BB";
  retryBtn.addEventListener("click", onRetry);
  errorEl.appendChild(retryBtn);

  const hint = document.createElement("p");
  hint.className = "empty-state__hint";
  hint.textContent = "Or browse company career pages directly below.";
  errorEl.appendChild(hint);

  container.appendChild(errorEl);
}

/**
 * Render the status count line
 */
export function renderCount(el, shown, total, companyCount) {
  el.textContent = `Showing ${shown} of ${total} roles across ${companyCount} companies`;
}

/**
 * Render Tier 2 company cards
 */
export function renderTier2(container, tier2Companies, discoveryLinks) {
  container.innerHTML = "";

  for (const company of tier2Companies) {
    const card = document.createElement("article");
    card.className = "tier2-card";

    const initial = document.createElement("div");
    initial.className = "tier2-card__initial";
    initial.textContent = company.logo_initial;
    card.appendChild(initial);

    const body = document.createElement("div");
    body.className = "tier2-card__body";

    const name = document.createElement("h4");
    name.className = "tier2-card__name";
    name.textContent = company.name;
    body.appendChild(name);

    body.appendChild(createCategoryBadge(company.category));

    const link = document.createElement("a");
    link.className = "btn btn--secondary tier2-card__link";
    link.href = company.careers_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View Careers Page \u2192";
    body.appendChild(link);

    card.appendChild(body);
    container.appendChild(card);
  }

  // Discovery links
  for (const item of discoveryLinks) {
    const card = document.createElement("article");
    card.className = "tier2-card";

    const initial = document.createElement("div");
    initial.className = "tier2-card__initial tier2-card__initial--board";
    initial.textContent = "\u2605";
    card.appendChild(initial);

    const body = document.createElement("div");
    body.className = "tier2-card__body";

    const name = document.createElement("h4");
    name.className = "tier2-card__name";
    name.textContent = item.name;
    body.appendChild(name);

    const catBadge = document.createElement("span");
    catBadge.className = "badge badge--category";
    catBadge.textContent = item.category;
    body.appendChild(catBadge);

    const link = document.createElement("a");
    link.className = "btn btn--secondary tier2-card__link";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Browse Jobs \u2192";
    body.appendChild(link);

    card.appendChild(body);
    container.appendChild(card);
  }
}

/**
 * Populate a multi-select dropdown
 */
export function populateDropdown(selectEl, options, labelKey = "name", valueKey = "id") {
  // Keep the first "All" option if present
  const firstOption = selectEl.querySelector("option");
  selectEl.innerHTML = "";
  if (firstOption) selectEl.appendChild(firstOption);

  for (const opt of options) {
    const option = document.createElement("option");
    option.value = typeof opt === "string" ? opt : opt[valueKey];
    option.textContent = typeof opt === "string" ? opt : opt[labelKey];
    selectEl.appendChild(option);
  }
}
