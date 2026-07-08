import type { BuiltRoute, ShowYearSummary, SnapshotLink } from '../types/snapshot';

// Source of truth for which years and sub-routes are live in fpsf-reborn.
// Add a route entry when a new page goes live. A year with empty `routes`
// is still planned.
//
// Route conventions (matching dayfornight-reborn):
//   /{year}/                 canonical event-state landing
//   /{year}/presale/         earlier presale state (where captured)
//   /{year}/recap/           post-festival recap state (where captured)
//   /{year}/lineup/          lineup page
//   /{year}/schedule/        schedule page
//   /{year}/sponsors/        sponsors page
//   /{year}/{nav-target}/    any other sub-page the year's original nav had
export const showYears: ShowYearSummary[] = [
  { year: 2009, edition: 'Free Press Summer Fest', routes: [] },
  {
    year: 2010,
    edition: 'Free Press Summer Fest 2010',
    routes: [
      {
        label: 'Main',
        href: '/2010/',
        description: 'February-March 2010 canonical event-state main page (lineup announced, June 5-6)',
        sourceSnapshot: '20100218095214',
      },
      {
        label: 'Presale',
        href: '/2010/presale/',
        description: 'Feb 13 2010 "Full Line Up Coming Soon" holding page',
        sourceSnapshot: '20100213030907',
      },
    ],
  },
  {
    year: 2011,
    edition: 'Free Press Summer Fest III',
    routes: [
      {
        label: 'Main',
        href: '/2011/',
        description: 'June 2011 event-time main page (lineup announced)',
        sourceSnapshot: '20110605020053',
      },
      {
        label: 'Presale',
        href: '/2011/presale/',
        description: 'February 2011 presale state',
        sourceSnapshot: '20110207140205',
      },
    ],
  },
  { year: 2012, edition: 'Free Press Summer Fest IV', routes: [] },
  { year: 2013, edition: 'Free Press Summer Fest V', routes: [] },
  {
    year: 2014,
    edition: 'Free Press Summer Festival',
    routes: [
      {
        label: 'Main',
        href: '/2014/',
        description: 'May 2014 lineup-released main page',
        sourceSnapshot: '20140517104510',
      },
      {
        label: 'Presale',
        href: '/2014/presale/',
        description: 'January 2014 blind-presale state',
        sourceSnapshot: '20140116065620',
      },
    ],
  },
  { year: 2015, edition: 'Free Press Summer Festival 2015', routes: [
    {
      label: 'Main',
      href: '/2015/',
      description: 'July 2015 lineup-released main page (Foundation-era at NRG Park)',
      sourceSnapshot: '20150703195456',
    },
  ] },
  {
    year: 2016,
    edition: 'Free Press Summer Festival 2016',
    routes: [
      {
        label: 'Main',
        href: '/2016/',
        description: 'Spring 2016 home page (WordPress/Forte-child era, Eleanor Tinsley Park)',
        sourceSnapshot: '20160414202513',
      },
      {
        label: 'Lineup Announced',
        href: '/2016/announce/',
        description: 'March 2016 home page — lineup just announced, tickets on sale, e-list push',
        sourceSnapshot: '20160313220803',
      },
      {
        label: 'Post-Festival',
        href: '/2016/recap/',
        description: 'January 2017 post-festival home — "Thanks Houston! See you in June", e-list push for 2017',
        sourceSnapshot: '20170128184915',
      },
    ],
  },
  { year: 2017, edition: 'Free Press Summer Festival 2017', routes: [] },
  { year: 2018, edition: 'Free Press Summer Festival 2018', routes: [] },
];

// Years at or after this are the contiguous "hosted" rotation. 2009-2013
// (and the already-built 2010 + 2011) remain directly reachable by URL and
// listed in the dev index, but are intentionally excluded from the public
// year-picker, random-snapshot landing, and year-pill prev/next so there
// are no 2012-2013 time jumps in the tour. FPSF ran through 2018.
export const HOSTED_FROM_YEAR = 2014;

// Routes for a year in chronological state order: presale → main →
// recap/post-festival. Ordered by source capture timestamp (presale captures
// predate the event; recaps follow it). Returns a new array; never mutates.
export function orderedRoutes(routes: BuiltRoute[]): BuiltRoute[] {
  return [...routes].sort((a, b) =>
    (a.sourceSnapshot ?? '').localeCompare(b.sourceSnapshot ?? ''),
  );
}

export const liveShowYears = showYears.filter(
  (show) => show.routes.length > 0 && show.year >= HOSTED_FROM_YEAR,
);

// Flat, ordered list of every hosted (year, route) for rotation, year-pill
// prev/next, and the root landing index — contiguous from HOSTED_FROM_YEAR.
// Within each year, routes are ordered chronologically by their source capture
// timestamp, which yields the intended state order: presale → main →
// recap/post-festival (presale captures predate the event, recaps follow it).
export const liveSnapshots: SnapshotLink[] = liveShowYears.flatMap((show) =>
  orderedRoutes(show.routes).map((route) => ({
    year: show.year,
    edition: show.edition,
    label: route.label,
    href: route.href,
    description: route.description,
  })),
);

export function findShowYear(year: number): ShowYearSummary | undefined {
  return showYears.find((show) => show.year === year);
}

// Best entry point for a year. Returns `/{year}/` if a canonical landing
// is live, otherwise the first available sub-route, otherwise undefined.
export function canonicalHref(year: number): string | undefined {
  const show = findShowYear(year);
  if (!show || show.routes.length === 0) return undefined;
  const root = show.routes.find((route) => route.href === `/${year}/`);
  return (root ?? show.routes[0]).href;
}

// Snapshot list neighbors for the year-pill. `currentHref` should exactly
// match an entry in liveSnapshots; otherwise the helper returns just
// the surrounding endpoints.
export function adjacentSnapshots(currentHref: string): {
  prev?: SnapshotLink;
  next?: SnapshotLink;
} {
  const index = liveSnapshots.findIndex((entry) => entry.href === currentHref);
  if (index === -1) return {};
  return {
    prev: index > 0 ? liveSnapshots[index - 1] : undefined,
    next: index < liveSnapshots.length - 1 ? liveSnapshots[index + 1] : undefined,
  };
}

export function findSnapshot(currentHref: string): SnapshotLink | undefined {
  return liveSnapshots.find((entry) => entry.href === currentHref);
}
