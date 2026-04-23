#!/usr/bin/env node

// fetch-jobs.js — Node.js script for GitHub Actions daily cache refresh
// Uses built-in fetch (Node 18+). No npm dependencies.

// ─── Inline company data (avoids ESM import issues in Actions) ───
const TIER1_COMPANIES = [
  {
    id: "sony_music",
    name: "Sony Music Entertainment",
    ats: "greenhouse",
    board_token: "sonymusicentertainment",
    category: "Major Label"
  },
  {
    id: "concord_music",
    name: "Concord Music",
    ats: "greenhouse",
    board_token: "concordmusicgroup", // UNVERIFIED
    category: "Major Label"
  },
  {
    id: "kobalt_music",
    name: "Kobalt Music",
    ats: "greenhouse",
    board_token: "kobalt", // UNVERIFIED
    category: "Publishing / Rights"
  },
  {
    id: "soundexchange",
    name: "SoundExchange",
    ats: "greenhouse",
    board_token: "soundexchange", // UNVERIFIED
    category: "Rights & Royalties"
  },
  {
    id: "pandora",
    name: "Pandora",
    ats: "greenhouse",
    board_token: "pandora", // UNVERIFIED
    category: "Streaming"
  },
  {
    id: "siriusxm",
    name: "SiriusXM",
    ats: "greenhouse",
    board_token: "siriusxm", // UNVERIFIED
    category: "Streaming"
  },
  {
    id: "spotify",
    name: "Spotify",
    ats: "lever",
    board_token: "spotify",
    category: "Streaming"
  },
  {
    id: "warner_music",
    name: "Warner Music Group",
    ats: "lever",
    board_token: "wmg",
    category: "Major Label"
  },
  {
    id: "beatport",
    name: "Beatport",
    ats: "lever",
    board_token: "beatport", // UNVERIFIED
    category: "Music Tech"
  },
  {
    id: "bandsintown",
    name: "Bandsintown",
    ats: "lever",
    board_token: "bandsintown", // UNVERIFIED
    category: "Music Tech"
  }
];

// ─── Normalizer functions (duplicated to avoid import) ───────────

function normalizeLocation(raw) {
  if (!raw) return null;
  const match = raw.match(/([A-Za-z\s.]+),\s*([A-Z]{2})/);
  if (match) return `${match[1].trim()}, ${match[2]}`;
  return raw.trim();
}

function isRemote(location) {
  if (!location) return false;
  return /remote/i.test(location);
}

function inferSeniority(title) {
  const t = title.toLowerCase();
  if (/\b(intern|internship)\b/.test(t)) return "Intern";
  if (/\b(president|chief|c-suite|ceo|cfo|cmo|coo)\b/.test(t) && !/vice\s*president/i.test(t)) return "C-Suite";
  if (/\b(vp|vice\s*president|svp|evp)\b/.test(t)) return "VP/Executive";
  if (/\b(director|sr\.?\s*director|head\s+of)\b/.test(t)) return "Director";
  if (/\b(manager|senior|sr\.?|lead|specialist|supervisor)\b/.test(t)) return "Manager/Senior";
  if (/\b(associate|coordinator|assistant|analyst)\b/.test(t)) return "Entry/Associate";
  return null;
}

const FUNCTION_KEYWORDS = {
  "Finance & Accounting": /\b(finance|financial|accounting|fp&a|treasury|controller|revenue|pricing|budget)\b/i,
  "Strategy & Biz Dev": /\b(strategy|business\s*development|partnerships|corporate\s*development|ventures|m&a)\b/i,
  "Marketing": /\b(marketing|brand|campaign|growth|creative\s*services|content\s*marketing|go-to-market)\b/i,
  "Operations": /\b(operations|supply\s*chain|logistics|process|program\s*manager)\b/i,
  "Analytics & Data": /\b(analytics|data|insights|intelligence|research|reporting|bi)\b/i,
  "Legal & Business Affairs": /\b(legal|counsel|business\s*affairs|licensing|compliance|contracts|rights)\b/i,
  "Technology & Product": /\b(engineering|software|product|developer|platform|tech|data\s*science)\b/i,
  "Artist & Label Services": /\b(a&r|artist\s*relations|label\s*management|catalog|streaming|dsp)\b/i,
  "People & Talent": /\b(hr|human\s*resources|talent|recruiting|people\s*operations|culture)\b/i
};

const MBA_RELEVANT = new Set([
  "Finance & Accounting", "Strategy & Biz Dev", "Marketing", "Operations",
  "Analytics & Data", "Legal & Business Affairs", "Technology & Product"
]);

function inferFunctions(title, department) {
  const combined = `${title} ${department || ""}`;
  const tags = [];
  for (const [tag, pattern] of Object.entries(FUNCTION_KEYWORDS)) {
    if (pattern.test(combined)) tags.push(tag);
  }
  return tags;
}

function extractSalary(content, metadata) {
  const result = { min: null, max: null, text: null };

  if (metadata && Array.isArray(metadata)) {
    for (const m of metadata) {
      const key = (m.name || m.key || "").toLowerCase();
      if (key.includes("salary") || key.includes("compensation") || key.includes("pay")) {
        const val = m.value || "";
        const parsed = parseSalaryString(val);
        if (parsed.min !== null) return parsed;
        result.text = val;
        return result;
      }
    }
  }

  const stripped = content.replace(/<[^>]*>/g, " ");
  return parseSalaryString(stripped);
}

function parseSalaryString(text) {
  const result = { min: null, max: null, text: null };

  const rangePattern = /\$\s*([\d,]+(?:\.\d+)?)\s*[kK]?\s*(?:[-–—to]+)\s*\$?\s*([\d,]+(?:\.\d+)?)\s*[kK]?/;
  const rangeMatch = text.match(rangePattern);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1].replace(/,/g, ""));
    let max = parseFloat(rangeMatch[2].replace(/,/g, ""));
    if (text.substring(rangeMatch.index, rangeMatch.index + rangeMatch[0].length).toLowerCase().includes("k")) {
      if (min < 1000) min *= 1000;
      if (max < 1000) max *= 1000;
    }
    if (!isNaN(min) && !isNaN(max)) {
      result.min = Math.round(min);
      result.max = Math.round(max);
      return result;
    }
  }

  const singlePattern = /\$\s*([\d,]+(?:\.\d+)?)\s*[kK]?/;
  const singleMatch = text.match(singlePattern);
  if (singleMatch) {
    let val = parseFloat(singleMatch[1].replace(/,/g, ""));
    if (singleMatch[0].toLowerCase().includes("k") && val < 1000) val *= 1000;
    if (!isNaN(val) && val > 10000) {
      result.min = Math.round(val);
      return result;
    }
  }

  const usdPattern = /USD\s*([\d,]+)\s*(?:to|-)\s*([\d,]+)/i;
  const usdMatch = text.match(usdPattern);
  if (usdMatch) {
    const min = parseFloat(usdMatch[1].replace(/,/g, ""));
    const max = parseFloat(usdMatch[2].replace(/,/g, ""));
    if (!isNaN(min) && !isNaN(max)) {
      result.min = Math.round(min);
      result.max = Math.round(max);
      return result;
    }
  }

  return result;
}

// ─── Normalize ────────────────────────────────────────────────────

function normalizeGreenhouseJob(raw, company) {
  const location = raw.location ? raw.location.name : null;
  const content = raw.content || "";
  const salary = extractSalary(content, raw.metadata);
  const dept = (raw.departments && raw.departments.length > 0) ? raw.departments[0].name : null;
  const fns = inferFunctions(raw.title || "", dept);

  return {
    id: `greenhouse_${raw.id}`,
    title: raw.title || "Untitled Role",
    company: company.name,
    company_id: company.id,
    category: company.category,
    location,
    location_normalized: normalizeLocation(location),
    is_remote: isRemote(location),
    salary_min: salary.min,
    salary_max: salary.max,
    salary_text: salary.text,
    salary_currency: "USD",
    department: dept,
    posted_at: raw.updated_at || null,
    updated_at: raw.updated_at || new Date().toISOString(),
    apply_url: raw.absolute_url || "",
    source: "greenhouse",
    seniority: inferSeniority(raw.title || ""),
    functions: fns,
    is_grad_relevant: fns.some(f => MBA_RELEVANT.has(f))
  };
}

function normalizeLeverJob(raw, company) {
  const location = raw.categories ? raw.categories.location : null;
  const content = raw.descriptionPlain || "";
  const salary = extractSalary(content);
  const dept = raw.categories ? (raw.categories.team || null) : null;
  const fns = inferFunctions(raw.text || "", dept);

  return {
    id: `lever_${raw.id}`,
    title: raw.text || "Untitled Role",
    company: company.name,
    company_id: company.id,
    category: company.category,
    location,
    location_normalized: normalizeLocation(location),
    is_remote: isRemote(location),
    salary_min: salary.min,
    salary_max: salary.max,
    salary_text: salary.text,
    salary_currency: "USD",
    department: dept,
    posted_at: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updated_at: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    apply_url: raw.hostedUrl || "",
    source: "lever",
    seniority: inferSeniority(raw.text || ""),
    functions: fns,
    is_grad_relevant: fns.some(f => MBA_RELEVANT.has(f))
  };
}

// ─── Fetch ────────────────────────────────────────────────────────

async function fetchCompany(company) {
  try {
    if (company.ats === "greenhouse") {
      const url = `https://boards-api.greenhouse.io/v1/boards/${company.board_token}/jobs?content=true`;
      const resp = await fetch(url);
      if (!resp.ok) {
        console.warn(`  [SKIP] ${company.name} — HTTP ${resp.status}`);
        return [];
      }
      const data = await resp.json();
      const jobs = (data.jobs || []).map(j => normalizeGreenhouseJob(j, company));
      console.log(`  [OK]   ${company.name} — ${jobs.length} jobs`);
      return jobs;
    }

    if (company.ats === "lever") {
      const url = `https://api.lever.co/v0/postings/${company.board_token}?mode=json`;
      const resp = await fetch(url);
      if (!resp.ok) {
        console.warn(`  [SKIP] ${company.name} — HTTP ${resp.status}`);
        return [];
      }
      const data = await resp.json();
      if (!Array.isArray(data)) {
        console.warn(`  [SKIP] ${company.name} — unexpected response format`);
        return [];
      }
      const jobs = data.map(j => normalizeLeverJob(j, company));
      console.log(`  [OK]   ${company.name} — ${jobs.length} jobs`);
      return jobs;
    }
  } catch (err) {
    console.warn(`  [ERR]  ${company.name} — ${err.message}`);
    return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log("Fetching jobs from Tier 1 companies...\n");

  const allJobs = [];
  for (const company of TIER1_COMPANIES) {
    const jobs = await fetchCompany(company);
    allJobs.push(...jobs);
  }

  console.log(`\nTotal: ${allJobs.length} jobs from ${new Set(allJobs.map(j => j.company_id)).size} companies`);

  const output = {
    generated_at: new Date().toISOString(),
    total: allJobs.length,
    jobs: allJobs
  };

  const fs = await import("node:fs");
  const path = await import("node:path");

  const outDir = path.default.join(process.cwd(), "public");
  if (!fs.default.existsSync(outDir)) {
    fs.default.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.default.join(outDir, "jobs-cache.json");
  fs.default.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWritten to ${outPath}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
