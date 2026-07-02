// Shared snapshot schema for fpsf-reborn show-year data files.
//
// Every src/data/snapshot-<year>.json should satisfy `BaseSnapshot`.
// Year-specific extensions layer additional fields on top so each year
// keeps its full richness without breaking universal expectations
// (shared components, layouts, sitemap, served-link audits).
//
// Each show year stands on its own. The shape favors strict required
// fields so missing content is caught at build time, not in production.

export type Phase =
  | 'presale'
  | 'blind-presale'
  | 'lineup'
  | 'event'
  | 'post-show'
  | 'recap';

export interface NavItem {
  label: string;
  href: string;
  id?: string;
  className?: string;
  external?: boolean;
  subnav?: NavItem[];
}

export interface SocialLink {
  label: string;
  href: string;
  className?: string;
  title?: string;
}

export interface Sponsor {
  name: string;
  href: string;
  image?: string;
}

export interface Header {
  title: string;
  byline?: string;
  image?: string;
  description?: string;
}

export interface FooterMapColumn {
  heading: string;
  className?: string;
  href?: string;
  items: Array<{ label: string; href: string }>;
}

export interface SubscribeField {
  name: string;
  label: string;
  required: boolean;
}

export interface Slideshow {
  wrapperId: string;
  width: number;
  height: number;
  images: string[];
  intervalMs: number;
  fadeMs: number;
  note?: string;
}

// BaseSnapshot is what EVERY year's snapshot file must satisfy.
// `nav`, `social`, `sponsors`, `knownGaps` are required arrays
// (can be empty); make them empty rather than dropping the key.
export interface BaseSnapshot {
  year: number;
  edition: string;
  dates: string;
  /** ISO date (YYYY-MM-DD) of the first festival day, for structured data. */
  startDate?: string;
  /** ISO date (YYYY-MM-DD) of the last festival day, for structured data. */
  endDate?: string;
  location: string;
  sourceSnapshot: string;
  sourceDomain: string;
  phase: Phase;
  title: string;
  description: string;
  header: Header;
  nav: NavItem[];
  secondaryNav?: NavItem[];
  social: SocialLink[];
  sponsors: Sponsor[];
  sponsorBarImage?: string;
  footerMap?: FooterMapColumn[];
  footerLegal?: string;
  knownGaps: string[];
}

// Year-specific extensions — optional fields layered on top of BaseSnapshot.
// Layouts read whichever extensions they care about.

export interface PresaleExt {
  slideshow?: Slideshow;
  intro?: {
    headline: string;
    subhead: string;
    tagline: string;
    paragraphs: string[];
  };
  ctas?: {
    passUrl?: string;
    passImage?: string;
    passRightImage?: string;
    sonicbidsUrl?: string;
    sonicbidsImage?: string;
    lineupTeaser?: string;
    photographerCredit?: string;
  };
  vimeo?: { id: string; title: string };
  subscribe?: {
    actionUrl: string;
    fields: SubscribeField[];
    submitImage?: string;
  };
  twitterFeedUrl?: string;
}

export interface HeroExt {
  hero?: {
    videoUrl?: string;
    videoTitle?: string;
    image?: string;
    message?: string;
    messageBackground?: string;
  };
  announcements?: Array<{
    label?: string;
    href?: string;
    image?: string;
    links?: Array<{ label: string; href: string }>;
  }>;
}

export interface LineupArtist {
  name: string;
  image?: string | null;
  slug?: string;
  bio?: string;
  url?: string;
  cropPosition?: string;
}

// Fields present on canonical "main" event-state snapshots (lineup released).
export interface MainExt {
  eventDate?: { headline?: string; city?: string };
  banner?: {
    posterFull?: string;
    posterThumb?: string;
    videoUrl?: string;
    [key: string]: unknown;
  };
  lineup?: {
    note?: string;
    posterFull?: string;
    headliners?: LineupArtist[];
    undercard?: LineupArtist[];
  };
}

export type Snapshot = BaseSnapshot & Partial<PresaleExt & HeroExt & MainExt>;

// Show-year directory: source of truth for the year picker and year pill.
// `routes` lists the rebuilt URLs for that year (canonical landing,
// temporal states like presale/recap, and content sub-pages).
// Years with empty routes are still planned.
export interface BuiltRoute {
  label: string;
  href: string;
  description?: string;
  sourceSnapshot?: string;
}

export interface ShowYearSummary {
  year: number;
  edition: string;
  routes: BuiltRoute[];
}

export interface SnapshotLink {
  year: number;
  edition: string;
  label: string;
  href: string;
  description?: string;
}


