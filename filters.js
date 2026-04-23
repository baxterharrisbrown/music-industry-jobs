// filters.js — Pure filter functions
// Input: (jobs[], filterState) → jobs[]
// No DOM, no side effects

/**
 * filterState shape:
 * {
 *   search: string,
 *   functions: string[],      // selected function tags
 *   companies: string[],      // selected company IDs
 *   seniority: string|null,   // "Intern" | "Entry/Associate" | "Manager/Senior" | "Director+" | null (all)
 *   locationText: string,
 *   remoteOnly: boolean,
 *   mbaOnly: boolean
 * }
 */

export function applyFilters(jobs, state) {
  let filtered = jobs;

  // MBA filter
  if (state.mbaOnly) {
    filtered = filtered.filter(j => j.is_grad_relevant);
  }

  // Search — title, company, location
  if (state.search && state.search.trim()) {
    const q = state.search.toLowerCase().trim();
    filtered = filtered.filter(j =>
      (j.title && j.title.toLowerCase().includes(q)) ||
      (j.company && j.company.toLowerCase().includes(q)) ||
      (j.location && j.location.toLowerCase().includes(q))
    );
  }

  // Function tags
  if (state.functions && state.functions.length > 0) {
    filtered = filtered.filter(j =>
      j.functions.some(f => state.functions.includes(f))
    );
  }

  // Companies
  if (state.companies && state.companies.length > 0) {
    filtered = filtered.filter(j => state.companies.includes(j.company_id));
  }

  // Seniority
  if (state.seniority) {
    if (state.seniority === "Director+") {
      filtered = filtered.filter(j =>
        j.seniority === "Director" ||
        j.seniority === "VP/Executive" ||
        j.seniority === "C-Suite"
      );
    } else {
      filtered = filtered.filter(j => j.seniority === state.seniority);
    }
  }

  // Location text
  if (state.locationText && state.locationText.trim()) {
    const loc = state.locationText.toLowerCase().trim();
    filtered = filtered.filter(j =>
      (j.location && j.location.toLowerCase().includes(loc)) ||
      (j.location_normalized && j.location_normalized.toLowerCase().includes(loc))
    );
  }

  // Remote only
  if (state.remoteOnly) {
    filtered = filtered.filter(j => j.is_remote);
  }

  return filtered;
}

/**
 * Sort jobs: newest first, nulls at bottom
 */
export function sortByDate(jobs) {
  return [...jobs].sort((a, b) => {
    if (!a.posted_at && !b.posted_at) return 0;
    if (!a.posted_at) return 1;
    if (!b.posted_at) return -1;
    return new Date(b.posted_at) - new Date(a.posted_at);
  });
}

/**
 * Get unique companies that have jobs in the current dataset
 */
export function getActiveCompanies(jobs) {
  const map = new Map();
  for (const j of jobs) {
    if (!map.has(j.company_id)) {
      map.set(j.company_id, j.company);
    }
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
