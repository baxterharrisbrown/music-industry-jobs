// companies.js — Company registry for Music Industry Jobs
// Each company is Tier 1 (live API) or Tier 2 (static careers link)

export const companies = [
  // ─── TIER 1 — GREENHOUSE ───────────────────────────────────────
  {
    id: "sony_music",
    name: "Sony Music Entertainment",
    tier: 1,
    ats: "greenhouse",
    board_token: "sonymusicentertainment",
    careers_url: "https://www.sonymusiccareers.com",
    category: "Major Label",
    logo_initial: "S"
  },
  {
    id: "concord_music",
    name: "Concord Music",
    tier: 1,
    ats: "greenhouse",
    board_token: "concordmusicgroup", // UNVERIFIED — returns 404; needs manual confirmation
    careers_url: "https://www.concordmusic.com/careers",
    category: "Major Label",
    logo_initial: "C"
  },
  {
    id: "kobalt_music",
    name: "Kobalt Music",
    tier: 1,
    ats: "greenhouse",
    board_token: "kobalt", // UNVERIFIED — returns 404; needs manual confirmation
    careers_url: "https://www.kobaltmusic.com",
    category: "Publishing / Rights",
    logo_initial: "K"
  },
  {
    id: "soundexchange",
    name: "SoundExchange",
    tier: 1,
    ats: "greenhouse",
    board_token: "soundexchange", // UNVERIFIED — returns 404; needs manual confirmation
    careers_url: "https://www.soundexchange.com/about/careers/",
    category: "Rights & Royalties",
    logo_initial: "S"
  },
  {
    id: "pandora",
    name: "Pandora",
    tier: 1,
    ats: "greenhouse",
    board_token: "pandora", // UNVERIFIED — returns 404; needs manual confirmation
    careers_url: "https://www.pandora.com/careers",
    category: "Streaming",
    logo_initial: "P"
  },
  {
    id: "siriusxm",
    name: "SiriusXM",
    tier: 1,
    ats: "greenhouse",
    board_token: "siriusxm", // UNVERIFIED — returns 404; needs manual confirmation
    careers_url: "https://careers.siriusxm.com",
    category: "Streaming",
    logo_initial: "S"
  },

  // ─── TIER 1 — LEVER ───────────────────────────────────────────
  {
    id: "spotify",
    name: "Spotify",
    tier: 1,
    ats: "lever",
    board_token: "spotify",
    careers_url: "https://www.lifeatspotify.com/jobs",
    category: "Streaming",
    logo_initial: "S"
  },
  {
    id: "warner_music",
    name: "Warner Music Group",
    tier: 1,
    ats: "lever",
    board_token: "wmg",
    careers_url: "https://www.wmg.com/careers",
    category: "Major Label",
    logo_initial: "W"
  },
  {
    id: "beatport",
    name: "Beatport",
    tier: 1,
    ats: "lever",
    board_token: "beatport", // UNVERIFIED — returns 404; needs manual confirmation
    careers_url: "https://www.beatport.com",
    category: "Music Tech",
    logo_initial: "B"
  },
  {
    id: "bandsintown",
    name: "Bandsintown",
    tier: 1,
    ats: "lever",
    board_token: "bandsintown", // UNVERIFIED — returns 404; needs manual confirmation
    careers_url: "https://www.bandsintown.com",
    category: "Music Tech",
    logo_initial: "B"
  },

  // ─── TIER 2 — WORKDAY / NO-API (static links only) ────────────
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
