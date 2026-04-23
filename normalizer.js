// normalizer.js — Pure functions for job schema normalization
// No DOM, no fetch — import and call from app.js or fetch-jobs.js

/**
 * Normalize a Greenhouse job object to the standard schema
 */
export function normalizeGreenhouseJob(raw, company) {
  const location = raw.location ? raw.location.name : null;
  const content = raw.content || "";
  const salary = extractSalary(content, raw.metadata);

  return {
    id: `greenhouse_${raw.id}`,
    title: raw.title || "Untitled Role",
    company: company.name,
    company_id: company.id,
    category: company.category,
    location: location,
    location_normalized: normalizeLocation(location),
    is_remote: isRemote(location),
    salary_min: salary.min,
    salary_max: salary.max,
    salary_text: salary.text,
    salary_currency: "USD",
    department: extractGreenhouseDepartment(raw),
    posted_at: raw.updated_at || null,
    updated_at: raw.updated_at || new Date().toISOString(),
    apply_url: raw.absolute_url || "",
    source: "greenhouse",
    seniority: inferSeniority(raw.title || ""),
    functions: inferFunctions(raw.title || "", extractGreenhouseDepartment(raw)),
    is_grad_relevant: false // set after functions are inferred
  };
}

/**
 * Normalize a Lever job object to the standard schema
 */
export function normalizeLeverJob(raw, company) {
  const location = raw.categories ? raw.categories.location : null;
  const content = raw.descriptionPlain || "";
  const salary = extractSalary(content);

  return {
    id: `lever_${raw.id}`,
    title: raw.text || "Untitled Role",
    company: company.name,
    company_id: company.id,
    category: company.category,
    location: location,
    location_normalized: normalizeLocation(location),
    is_remote: isRemote(location),
    salary_min: salary.min,
    salary_max: salary.max,
    salary_text: salary.text,
    salary_currency: "USD",
    department: raw.categories ? (raw.categories.team || null) : null,
    posted_at: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    updated_at: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    apply_url: raw.hostedUrl || "",
    source: "lever",
    seniority: inferSeniority(raw.text || ""),
    functions: inferFunctions(raw.text || "", raw.categories ? raw.categories.team : null),
    is_grad_relevant: false
  };
}

/**
 * Post-process: set is_grad_relevant based on inferred functions
 */
export function finalizeJob(job) {
  const mbaRelevantTags = new Set([
    "Finance & Accounting",
    "Strategy & Biz Dev",
    "Marketing",
    "Operations",
    "Analytics & Data",
    "Legal & Business Affairs",
    "Technology & Product"
  ]);
  job.is_grad_relevant = job.functions.some(f => mbaRelevantTags.has(f));
  return job;
}

// ─── Salary Extraction ────────────────────────────────────────────

export function extractSalary(content, metadata) {
  const result = { min: null, max: null, text: null };

  // Check Greenhouse metadata first
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

  // Regex on content
  const stripped = content.replace(/<[^>]*>/g, " ");
  const parsed = parseSalaryString(stripped);
  if (parsed.min !== null || parsed.text !== null) return parsed;

  return result;
}

function parseSalaryString(text) {
  const result = { min: null, max: null, text: null };

  // Match range: $XX,XXX - $XX,XXX or $XXk - $XXXk
  const rangePattern = /\$\s*([\d,]+(?:\.\d+)?)\s*[kK]?\s*(?:[-–—to]+)\s*\$?\s*([\d,]+(?:\.\d+)?)\s*[kK]?/;
  const rangeMatch = text.match(rangePattern);
  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1].replace(/,/g, ""));
    let max = parseFloat(rangeMatch[2].replace(/,/g, ""));
    // Handle "k" suffix
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

  // Match single figure: $XX,XXX or $XXk
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

  // Check for "USD XX to XX"
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

// ─── Location Normalization ────────────────────────────────────────

export function normalizeLocation(raw) {
  if (!raw) return null;
  // Try to extract "City, State" pattern
  const match = raw.match(/([A-Za-z\s.]+),\s*([A-Z]{2})/);
  if (match) return `${match[1].trim()}, ${match[2]}`;
  return raw.trim();
}

export function isRemote(location) {
  if (!location) return false;
  return /remote/i.test(location);
}

// ─── Seniority Inference ───────────────────────────────────────────

export function inferSeniority(title) {
  const t = title.toLowerCase();

  if (/\b(intern|internship)\b/.test(t)) return "Intern";

  if (/\b(president|chief|c-suite|ceo|cfo|cmo|coo)\b/.test(t) && !/vice\s*president/i.test(t))
    return "C-Suite";

  if (/\b(vp|vice\s*president|svp|evp)\b/.test(t)) return "VP/Executive";

  if (/\b(director|sr\.?\s*director|head\s+of)\b/.test(t)) return "Director";

  if (/\b(manager|senior|sr\.?|lead|specialist|supervisor)\b/.test(t))
    return "Manager/Senior";

  if (/\b(associate|coordinator|assistant|analyst)\b/.test(t))
    return "Entry/Associate";

  return null;
}

// ─── Function Tag Inference ────────────────────────────────────────

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

export function inferFunctions(title, department) {
  const combined = `${title} ${department || ""}`;
  const tags = [];

  for (const [tag, pattern] of Object.entries(FUNCTION_KEYWORDS)) {
    if (pattern.test(combined)) {
      tags.push(tag);
    }
  }

  return tags;
}

// ─── Department Extraction ─────────────────────────────────────────

function extractGreenhouseDepartment(raw) {
  if (raw.departments && raw.departments.length > 0) {
    return raw.departments[0].name || null;
  }
  return null;
}
