# fpsf-reborn

Astro static rebuild of Free Press Summer Fest show-year sites, reconstructed from raw Wayback captures and recovered assets in the sibling `../fpsf-archivist` repository.

## Commands

- Install dependencies: `npm install`
- Local dev server: `npm run dev`
- Static build: `npm run build`
- Preview built site: `npm run preview`

## Show year status

| Show year | Status | Source snapshot | Era |
|---|---|---|---|
| 2009 | Planned | `20090607093330` | Legacy static |
| 2010 | Planned | `20100620154423` | Legacy static |
| 2011 | In progress | `20110207140205` (presale) | Legacy PHP |
| 2012 | Planned | `20121107015903` | Sparse transition |
| 2013 | Planned | `20130302063004` | FPSF assets |
| 2014 | Planned | `20140116065620` | FPSF assets |
| 2015 | Planned | `20150703195456` | App / Foundation |
| 2016 | Planned | `20160712153331` | WordPress / Forte |
| 2017 | Planned | `20170818114202` | WordPress / Forte |

## Conventions

Mirrors the Day for Night reborn structure:

- `src/pages/<year>/...` — year-scoped routes.
- `src/data/snapshot-<year>.json` — extracted structured content per year.
- `src/layouts/Fpsf<year>Layout.astro` — era-specific shell components.
- `src/styles/fpsf-<year>.css` — preserved era CSS.
- `public/shared-assets/<year>/...` — fonts, images, JS preserved verbatim from raw captures.

Year-specific archive HTML and recovered assets are sourced from `../fpsf-archivist/raw/<year>/<timestamp>/`.
