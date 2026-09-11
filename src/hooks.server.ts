/**
 * Three things run on every request: the app-path redirect, the bare-entry-path
 * locale negotiation, then the `<html lang>` rewrite.
 *
 * The redirect exists because the app used to live at this same host before the apex
 * flip (#424) - every bookmark, deep link and extension pairing made against
 * `https://pitchbox.app/<app-path>` still points here, and would otherwise 404
 * against the landing instead of reaching the app. `$lib/app-redirect` decides which
 * paths those are and where they go; `PUBLIC_APP_ORIGIN` (default
 * `https://app.pitchbox.app`, set in `vite.config.ts`) is the one thing a self-hoster
 * running the app on a different host needs to override.
 *
 * The locale negotiation (LOR-225) answers the other half of what the old comment
 * here used to say ("no Accept-Language, no cookie"): an Italian visitor landing on
 * the bare domain used to get English with no way out. Only the four bare,
 * locale-neutral entry paths (`/`, `/pricing`, `/privacy`, `/terms`) are ever
 * negotiated - an explicit `/it/...` path, or any other path a visitor typed or
 * bookmarked, is never rewritten, so a crawler always gets the language the URL it
 * requested actually names, and the `hreflang` alternates in `Seo.svelte` still list
 * both. The redirect is a 302: a cached 301 on the root domain is not something you
 * can take back. A cookie the language switch writes (`LOCALE_COOKIE`,
 * `+layout.svelte`) outranks the header, so a visitor who picked a language keeps it
 * on the next visit even when their browser disagrees.
 *
 * The `<html lang>` rewrite is unrelated: `app.html`'s hardcoded `lang="en"` becomes
 * the locale the URL path itself decides (`localeFromPathname`, `$lib/i18n`), read
 * after any redirect above has already happened.
 */
import { appRedirectTarget, isAppPath } from '$lib/app-redirect';
import {
	DEFAULT_LOCALE,
	localeFromPathname,
	localizedPath,
	LOCALE_COOKIE,
	type Locale
} from '$lib/i18n';
import { PUBLIC_APP_ORIGIN } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';

/** Only these bare, locale-neutral paths are ever negotiated - everything else is
 * either already locale-prefixed or a specific page a visitor typed, and neither is
 * ever rewritten. `Record<string, true>`, the same static-lookup shape
 * `$lib/app-redirect`'s `APP_PATH_SEGMENT_MAP` already uses for this kind of table. */
const BARE_ENTRY_PATHS: Record<string, true> = {
	'/': true,
	'/pricing': true,
	'/privacy': true,
	'/terms': true
};

/** One `Accept-Language` entry, tag lowercased, with its RFC 7231 `q` weight (default
 * 1 when absent). Never throws: a fragment whose weight is not a real number in
 * [0, 1] is dropped rather than crashing the request, and no header at all parses to
 * no preference. */
function parseAcceptLanguage(header: string | null): Array<{ tag: string; q: number }> {
	if (!header) return [];
	const weights: Array<{ tag: string; q: number }> = [];
	for (const entry of header.split(',')) {
		const [tagPart, ...params] = entry.split(';');
		const tag = tagPart?.trim().toLowerCase();
		if (!tag) continue;
		const qParam = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
		let q = 1;
		if (qParam) {
			const value = Number(qParam.slice(2));
			if (!Number.isFinite(value) || value < 0 || value > 1) continue;
			q = value;
		}
		weights.push({ tag, q });
	}
	return weights;
}

/** The highest-quality tag that maps to a known locale wins. A header with nothing
 * parseable, only unrelated tags, or no header at all falls back to English rather
 * than guessing. */
function negotiateLocale(header: string | null): Locale {
	let best: { locale: Locale; q: number } | null = null;
	for (const { tag, q } of parseAcceptLanguage(header)) {
		const locale: Locale | null =
			tag === 'it' || tag.startsWith('it-')
				? 'it'
				: tag === 'en' || tag.startsWith('en-')
					? 'en'
					: null;
		if (locale && (!best || q > best.q)) best = { locale, q };
	}
	return best?.locale ?? DEFAULT_LOCALE;
}

export const handle: Handle = async ({ event, resolve }) => {
	if (isAppPath(event.url.pathname)) {
		redirect(308, appRedirectTarget(event.url, PUBLIC_APP_ORIGIN));
	}

	if (BARE_ENTRY_PATHS[event.url.pathname] === true) {
		const cookieLocale = event.cookies.get(LOCALE_COOKIE);
		const preferred: Locale =
			cookieLocale === 'en' || cookieLocale === 'it'
				? cookieLocale
				: negotiateLocale(event.request.headers.get('accept-language'));
		if (preferred === 'it') {
			redirect(302, `${localizedPath(event.url.pathname, 'it')}${event.url.search}`);
		}
	}

	const locale = localeFromPathname(event.url.pathname);

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('lang="en"', `lang="${locale}"`)
	});
};
