// companies.js — Company registry for Music Industry Jobs
// Each company is Tier 1 (live API) or Tier 2 (static careers link)

export const companies = [
  // ─── TIER 1 — GREENHOUSE ──────────────────────────────────────────────────
  {
    id: "sony_music",
    name: "Sony Music Entertainment",
    tier: 1,
    ats: "greenhouse",
    board_token: "sonymusicentertainment",  // ✅ Verified — 141 jobs
    careers_url: "https://www.sonymusiccareers.com",
    category: "Major Label",
    logo_initial: "S"
  },
  {
    id: "soundexchange",
    name: "SoundExchange",
    tier: 1,
    ats: "greenhouse",
    board_token: "soundexchangeinc",        // ✅ Verified — 3 jobs (was "soundexchange")
    careers_url: "https://www.soundexchange.com/about/careers/",
    category: "Rights & Royalties",
    logo_initial: "S"
  },

  // ─── TIER 1 — LEVER ───────────────────────────────────────────────────────
  {
    id: "spotify",
    name: "Spotify",
    tier: 1,
    ats: "lever",
    board_token: "spotify",                 // ✅ Verified — 175 jobs
    careers_url: "https://www.lifeatspotify.com/jobs",
    category: "Streaming",
    logo_initial: "S"
  },
  {
    id: "warner_music",
    name: "Warner Music Group",
    tier: 1,
    ats: "lever",
    board_token: "wmg",                     // ✅ Verified — 21 jobs
    careers_url: "https://www.wmg.com/careers",
    category: "Major Label",
    logo_initial: "W"
  },

  // ─── TIER 2 — WORKDAY (static links only) ─────────────────────────────────
  {
    id: "umg",
    name: "Universal Music Group",
    tier: 2,
    ats: "workday",
    board_token: null,
    careers_url: "https://umusic.wd5.myworkdayjobs.com/UMGUS",
    category: "Major Label",
    logo_initial: "U"
  },
  {
    id: "live_nation",
    name: "Live Nation / Ticketmaster",
    tier: 2,
    ats: "workday",
    board_token: null,
    careers_url: "https://livenation.wd1.myworkdayjobs.com/LNExternalSite",
    category: "Live Events",
    logo_initial: "L"
  },
  {
    id: "iheartmedia",
    name: "iHeartMedia",
    tier: 2,
    ats: "workday",
    board_token: null,
    careers_url: "https://careers.iheartmedia.com",
    category: "Media",
    logo_initial: "i"
  },
  {
    id: "riaa",
    name: "RIAA",
    tier: 2,
    ats: "workday",
    board_token: null,
    careers_url: "https://www.riaa.com/about-riaa/careers/",
    category: "Industry Org",
    logo_initial: "R"
  },

  // ─── TIER 2 — iCIMS (no public API) ───────────────────────────────────────
  {
    id: "concord_music",
    name: "Concord Music",
    tier: 2,
    ats: "icims",
    board_token: null,
    careers_url: "https://careers-concord.icims.com/jobs/intro",
    category: "Major Label",
    logo_initial: "C"
  },

  // ─── TIER 2 — WORKABLE (no public API) ────────────────────────────────────
  {
    id: "kobalt_music",
    name: "Kobalt Music",
    tier: 2,
    ats: "workable",
    board_token: null,
    careers_url: "https://apply.workable.com/kobalt-music/",
    category: "Publishing / Rights",
    logo_initial: "K"
  },
  {
    id: "bandsintown",
    name: "Bandsintown",
    tier: 2,
    ats: "workable",
    board_token: null,
    careers_url: "https://apply.workable.com/bandsintown/",
    category: "Music Tech",
    logo_initial: "B"
  },

  // ─── TIER 2 — CUSTOM CAREERS SITE (no public API) ─────────────────────────
  {
    id: "siriusxm",
    name: "SiriusXM + Pandora",
    tier: 2,
    ats: "custom",
    board_token: null,
    careers_url: "https://careers.siriusxm.com/careers/",
    category: "Streaming",
    logo_initial: "S"
  },
  {
    id: "beatport",
    name: "Beatport",
    tier: 2,
    ats: "custom",
    board_token: null,
    careers_url: "https://about.beatport.com/careers",
    category: "Music Tech",
    logo_initial: "B"
  }
];

export const discoveryLinks = [
  {
    name: "Music Business Worldwide Jobs",
    url: "https://www.musicbusinessworldwide.com/jobs/",
    category: "Industry Job Board"
  },
  {
    name: "Music Ally Jobs",
    url: "https://musically.com/jobs/",
    category: "Industry Job Board"
  },
  {
    name: "Variety Careers",
    url: "https://variety.com/c/careers/",
    category: "Industry Job Board"
  }
];

// Category color mappings for badges
export const categoryColors = {
  "Major Label":        { bg: "var(--cat-major-label)",     text: "var(--cat-major-label-text)" },
  "Streaming":          { bg: "var(--cat-streaming)",       text: "var(--cat-streaming-text)" },
  "Music Tech":         { bg: "var(--cat-music-tech)",      text: "var(--cat-music-tech-text)" },
  "Publishing / Rights":{ bg: "var(--cat-publishing)",      text: "var(--cat-publishing-text)" },
  "Rights & Royalties": { bg: "var(--cat-publishing)",      text: "var(--cat-publishing-text)" },
  "Live Events":        { bg: "var(--cat-live-events)",     text: "var(--cat-live-events-text)" },
  "Media":              { bg: "var(--cat-media)",           text: "var(--cat-media-text)" },
  "Industry Org":       { bg: "var(--cat-industry-org)",    text: "var(--cat-industry-org-text)" },
  "Industry Job Board": { bg: "var(--cat-industry-org)",    text: "var(--cat-industry-org-text)" }
};
