/**
 * Centralized Asset Management for IZHAR 2K26
 *
 * Provides a single source of truth for all image paths, posters, and logo references.
 * Automatically resolves paths using Vite's base URL (import.meta.env.BASE_URL)
 * to ensure images never break regardless of deployment environment (GitHub Pages, Vercel, localhost).
 */

/**
 * Normalizes an asset path and prepends the application's base URL.
 * Handles legacy prefixes, typos (like /l̥assets), and external URLs gracefully.
 */
export const getAssetUrl = (rawPath?: string | null): string => {
  if (!rawPath) return '';

  const path = String(rawPath).trim();

  // Return absolute or data URLs directly
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  // Remove possible typos or legacy prefixes (/l̥assets, /src/assets, /assets, etc.)
  let clean = path
    .replace(/^(\/)?[\u0000-\u001f\u0300-\u036f]*l[\u0300-\u036f]*assets\//i, '')
    .replace(/^(\/)?src\/assets\//i, '')
    .replace(/^(\/)?assets\//i, '')
    .replace(/^\/+/, '');

  // Vite BASE_URL (e.g. '/IZHARFEST/' or '/')
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  return `${normalizedBase}${clean}`;
};

/**
 * Standard Application Assets
 */
export const ASSETS = {
  LOGO: getAssetUrl('logo.png'),
  FAVICON: getAssetUrl('favicon.png'),
  MAIN_POSTER: getAssetUrl('poster.jpg'),
  POSTERS: {
    MAIN: getAssetUrl('poster.jpg'),
    WIRAS: getAssetUrl('posters/wiras.png'),
    SULUK: getAssetUrl('posters/suluk.jpg'),
    DIRAYA: getAssetUrl('posters/diraya.jpg'),
  },
} as const;

export interface PosterItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  accentColor: string;
  flagColor?: string;
  tag: string;
  leaders?: string;
}

/**
 * Official Fest Posters collection with curated details
 */
export const FEST_POSTERS: PosterItem[] = [
  {
    id: 'main',
    title: 'IZHAR 2K26 Arts Fest',
    subtitle: '"മുസ്ലിം ജീവിതം കേരളീയ പൈതൃകം" • Oct 09, 10, 11',
    badge: 'Official Theme Poster',
    image: ASSETS.POSTERS.MAIN,
    accentColor: '#f59e0b',
    tag: 'Fest Theme',
  },
  {
    id: 'wiras',
    title: 'TEAM WIRAS',
    subtitle: 'Leaders: riyas, hafeelh • White Flag Squad',
    badge: 'Team Wiras Flag Launch',
    image: ASSETS.POSTERS.WIRAS,
    accentColor: '#f8fafc',
    flagColor: '#ffffff',
    tag: 'Team Wiras',
    leaders: 'riyas, hafeelh',
  },
  {
    id: 'suluk',
    title: 'TEAM SULUK',
    subtitle: 'Leaders: nihal, shakeeb • Red Flag Squad',
    badge: 'Team Suluk Flag Launch',
    image: ASSETS.POSTERS.SULUK,
    accentColor: '#ef4444',
    flagColor: '#ef4444',
    tag: 'Team Suluk',
    leaders: 'nihal, shakeeb',
  },
  {
    id: 'diraya',
    title: 'TEAM DIRAYAH',
    subtitle: 'Leaders: Midlaj, anfas • Blue Flag Squad',
    badge: 'Team Dirayah Flag Launch',
    image: ASSETS.POSTERS.DIRAYA,
    accentColor: '#3b82f6',
    flagColor: '#3b82f6',
    tag: 'Team Dirayah',
    leaders: 'Midlaj, anfas',
  },
];

export interface TeamPosterInfo {
  src: string;
  alt: string;
  leaders: string;
  color: string;
  flagName: string;
}

/**
 * Resolves official flag-launch poster details for any given team name
 */
export const getTeamPoster = (name: string): TeamPosterInfo | null => {
  const n = (name || '').toLowerCase();
  if (n.includes('wiras')) {
    return {
      src: ASSETS.POSTERS.WIRAS,
      alt: 'Team Wiras Official Flag Launch Poster',
      leaders: 'riyas, hafeelh',
      color: '#f8fafc',
      flagName: 'White Flag Squad',
    };
  }
  if (n.includes('suluk')) {
    return {
      src: ASSETS.POSTERS.SULUK,
      alt: 'Team Suluk Official Flag Launch Poster',
      leaders: 'nihal, shakeeb',
      color: '#ef4444',
      flagName: 'Red Flag Squad',
    };
  }
  if (n.includes('diray')) {
    return {
      src: ASSETS.POSTERS.DIRAYA,
      alt: 'Team Dirayah Official Flag Launch Poster',
      leaders: 'Midlaj, anfas',
      color: '#3b82f6',
      flagName: 'Blue Flag Squad',
    };
  }
  return null;
};
