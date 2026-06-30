# fpsf-reborn

Astro static rebuild of Free Press Summer Fest show-year sites, reconstructed from raw Wayback captures and recovered assets in the sibling `../fpsf-archivist` repository.

## Commands

- Install dependencies: `npm install --no-audit --no-fund --cache "$TMPDIR/npm-cache-fpsf-reborn"`  
  (use the temp cache if the global `~/.npm` has root-owned files; otherwise plain `npm install` is fine)
- Local dev server: `npm run dev`
- Static build: `npm run build`
- Preview built site: `npm run preview`
- Sync assets for a year/state from the archivist:  
  `python3 scripts/sync_state_assets.py <year> <state> [--dry-run]`
- Strip Wayback URL prefixes + wombat wrappers from synced assets (run after a fresh sync):  
  `python3 scripts/strip_wayback_urls.py [--dry-run]`  
  Use `--target raw` and `--root ../fpsf-archivist/raw` to clean the source archive too.

## Show year status

| Show year | Status | Live routes | Source state(s) |
|---|---|---|---|
| 2009 | Planned | — | `20090607093330` candidate |
| 2010 | **Live** | `/2010/`, `/2010/presale/` | `20100218095214` (main), `20100213030907` (presale) |
| 2011 | **Live** | `/2011/`, `/2011/presale/` | `20110605020053` (main, FPSF III event-time), `20110207140205` (presale) |
| 2012 | Planned | — | `20121107015903` candidate (sparse year, 2 captures total) |
| 2013 | Planned | — | `20130302063004` candidate; needs Phase 2.1 sub-page discovery |
| 2014 | **Live** | `/2014/`, `/2014/presale/` | `20140517104510` (main, lineup released), `20140116065620` (blind presale) |
| 2015 | **Live** | `/2015/` | `20150703195456` (main, Foundation-era, NRG Park) |
| 2016 | Planned | — | Phase 2.1 + 2.2 complete in archivist; ready to port (all 16 Wayback HTML paths on disk) |
| 2017 | Planned | — | Phase 2.1 + 2.2 complete in archivist; ready to port (all 16 Wayback HTML paths + 64 Flickr photos on disk) |

The root `/` is a **random snapshot landing**: on visit, JS picks a live snapshot URL (with 20-minute sessionStorage cooldown), fetches its HTML, injects `<base href>`, and inlines the result so visitors land on a real FPSF page. Matches `dayfornight-reborn`. Falls back to a `<noscript>` nav listing every live route.

## Conventions

Mirrors the Day for Night reborn structure:

- `src/pages/{year}/` — year-scoped routes.
  - `src/pages/{year}/index.astro` is the canonical event-state landing.
  - Sub-routes like `src/pages/{year}/presale/index.astro`, `src/pages/{year}/lineup/index.astro`, `src/pages/{year}/recap/index.astro` are derived from the year's actual nav menu in the canonical captures. Sub-pages we have not yet rebuilt are simply not generated (the nav link 404s) per the working option (a): "do nothing for routes we haven't built."
- `src/data/snapshot-{year}-{state}.json` — extracted structured content per year + state. Required shape lives in [`src/types/snapshot.ts`](src/types/snapshot.ts).
- `src/data/show-years.ts` — single source of truth for which years are `live` vs `planned` and the routes per live year. Year-rotation pill and root random-landing both read from here.
- `src/layouts/Fpsf{year}Layout.astro` — per-year shell components. Layout accepts the snapshot as a prop so each state can pass its own.
- `src/layouts/BaseLayout.astro` — shared HTML scaffold; owns `<head>`, year-rotation pill, and dev-only `KnownGapsBanner`.
- `src/components/` — universal components: `PageHead`, `YearRotationPill`, `KnownGapsBanner`. Era-bound DOM (nav, sponsor runner, footer maps, social icons) lives inside per-year layouts; cross-year component extraction is deferred until a third year in the same visual family lands.
- `src/styles/fpsf-{year}.css` and `src/styles/fpsf-{year}-{state}.css` — preserved era CSS.
- `public/shared-assets/{year}/...` — fonts, images, JS preserved verbatim from raw captures.

## State collapsing (logical site states)

Multiple Wayback captures of the same logical site state collapse to a single rendered route. The grouping is described per year in `../fpsf-archivist/states-{year}.json`. Each state has a `canonical` timestamp plus `html_timestamps` and `asset_timestamps` siblings. `scripts/sync_state_assets.py` walks all timestamps in the group, canonical first, and copies asset files into `public/shared-assets/{year}/` — the canonical wins for any conflict.

Examples:

| Year | State | Canonical timestamp | # sibling timestamps used for asset recovery |
|---|---|---|---:|
| 2010 | main | `20100218095214` | 12 |
| 2010 | presale | `20100213030907` | 0 |
| 2011 | main | `20110605020053` | 35 |
| 2011 | presale | `20110207140205` | 16 |
| 2014 | main | `20140517104510` | 10 |
| 2014 | blind-presale | `20140116065620` | 7 |
| 2015 | main | `20150703195456` | 11 |

## Year-pill navigation

The bottom-right pill (`src/components/YearRotationPill.astro`) cycles through every entry in `liveSnapshots` (flat list from `show-years.ts`). Prev/Next show the adjacent live snapshot regardless of year. The pill is hidden on `/`.

## Known gaps

Each rendered page exposes its capture gaps via `KnownGapsBanner` (dev-only). The persistent gaps that won't recover via Wayback or local sync:

- 2010 colored-box background images (`graybox.png`, `purpleboxleft.png`, `scrollbox.png`, `bluebottomrect.png`, `whitecanvas.jpg`, `canvasback.gif`) — CSS color fallbacks substitute.
- 2011 mainslide hero images (`mainslide/funwunce.png` etc.) — referenced from inline JS only, never crawled.
- 2014 `2014vidthumb.jpg` hero — substituted by the recovered `fpsf_2014_lineup.jpg`.
- 2015 responsive banner images (`images/banner/br-home-*.jpg`) and 15 CSS-background sponsor logos — page renders with a gradient overlay and text-only sponsor grid.
- WordPress-era thumbnail variants (`-WxH-WxH.jpg`) for 2016/2017 — never crawled (confirmed via priority_3 CDX run that returned 0 of 500).

## Pending work

- **Port 2016 and 2017 Astro routes** — archivist now has all HTML + assets. Rewrite Flickr `<img src>` URLs at template-build time from `https://farmN.staticflickr.com/<path>` to `/shared-assets/2017/flickr/farmN/<path>`.
- Port 2013 (FPSF-assets era, sibling to 2014).
- Port 2009, 2012 (sparse legacy/transition years).
- Add served-link audit script (`scripts/audit-served-links.mjs`) that walks `dist/` after build.
- Optional: extend `archive_fpsf_year.py` to invoke `strip_wayback_urls.py --target raw` as a post-step so future downloads don't reintroduce wombat/Wayback URL artifacts.
