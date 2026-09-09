/**
 * This app has no auth and no per-visitor state, so the one rewrite every request
 * needs is `<html lang>`: `app.html`'s hardcoded `lang="en"` becomes the locale the
 * URL path itself decides (`localeFromPathname`, `$lib/i18n` - `/` is English, `/it`
 * is Italian, no `Accept-Language`, no cookie - the same URL renders the same
 * language for every visitor and every crawler, which is the entire point of
 * putting Italian on its own path).
 */
import { localeFromPathname } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const locale = localeFromPathname(event.url.pathname);

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('lang="en"', `lang="${locale}"`)
	});
};
