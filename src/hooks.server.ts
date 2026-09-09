/**
 * Two things run on every request: the app-path redirect, then the `<html lang>`
 * rewrite.
 *
 * The redirect exists because the app used to live at this same host before the apex
 * flip (#424) - every bookmark, deep link and extension pairing made against
 * `https://pitchbox.app/<app-path>` still points here, and would otherwise 404
 * against the landing instead of reaching the app. `$lib/app-redirect` decides which
 * paths those are and where they go; `PUBLIC_APP_ORIGIN` (default
 * `https://app.pitchbox.app`, set in `vite.config.ts`) is the one thing a self-hoster
 * running the app on a different host needs to override.
 *
 * The `<html lang>` rewrite is unrelated: `app.html`'s hardcoded `lang="en"` becomes
 * the locale the URL path itself decides (`localeFromPathname`, `$lib/i18n` - `/` is
 * English, `/it` is Italian, no `Accept-Language`, no cookie - the same URL renders
 * the same language for every visitor and every crawler, which is the entire point of
 * putting Italian on its own path).
 */
import { appRedirectTarget, isAppPath } from '$lib/app-redirect';
import { localeFromPathname } from '$lib/i18n';
import { PUBLIC_APP_ORIGIN } from '$env/static/public';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (isAppPath(event.url.pathname)) {
		redirect(308, appRedirectTarget(event.url, PUBLIC_APP_ORIGIN));
	}

	const locale = localeFromPathname(event.url.pathname);

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('lang="en"', `lang="${locale}"`)
	});
};
