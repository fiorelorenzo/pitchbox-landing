/**
 * The landing's own locale seam (issue #422/#423). Two locales, no negotiation, path
 * based: `/` English and `/it` Italian, so a crawler and a person get the same page
 * for the same URL every time - the entire point of putting Italian on its own path
 * rather than behind `Accept-Language` or a cookie. Copied from canonry-landing's own
 * `$lib/i18n.ts` (#423's brief names it as the mechanism to follow), which decided the
 * same thing for the same reason: a marketing page has to render one language per URL,
 * for every visitor, forever, not one language per visitor.
 */

export type Locale = 'en' | 'it';

export const LOCALES: readonly Locale[] = ['en', 'it'];

export const DEFAULT_LOCALE: Locale = 'en';

/** Endonyms, for the language link each of `/` and `/it` offers to the other - a
 * language picker that names Italian "Italian" to someone who only reads Italian has
 * failed. */
export const LOCALE_NAMES: Record<Locale, string> = { en: 'English', it: 'Italiano' };

/** `og:locale`'s value: Facebook's own underscore-region form, not a BCP-47 tag. */
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', it: 'it_IT' };

/** The only two locales this decides between: everything under `/it` is Italian,
 * whatever page follows, and everything else is English. No prefix matching beyond
 * that exact segment - `/italy` is not Italian. */
export function localeFromPathname(pathname: string): Locale {
	return pathname === '/it' || pathname.startsWith('/it/') ? 'it' : 'en';
}

/** The inverse of `localeFromPathname`: `path` (locale-neutral, always starting with
 * `/` - `'/'`, `'/privacy'`) turned into `locale`'s real route. Shared by `Seo.svelte`
 * (alternate links) and the sitemap route (#426), so the `/it` prefix rule has exactly
 * one implementation. */
export function localizedPath(path: string, locale: Locale): string {
	if (path === '/') return locale === 'it' ? '/it' : '/';
	return locale === 'it' ? `/it${path}` : path;
}
