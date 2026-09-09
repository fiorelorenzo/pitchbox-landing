/**
 * The sitemap (#426): generated from `$lib/content.ts`'s `PUBLIC_ROUTES` list rather
 * than hand-typed XML, one `<url>` per route per locale via `$lib/i18n`'s own
 * `localizedPath` - the same function `Seo.svelte` uses for its alternate links, so
 * the sitemap and the per-page hreflang tags cannot disagree about what a locale's
 * URL for a given route is. Lists only public pages: `PUBLIC_ROUTES` names nothing
 * under the app host, and nothing behind a login, because none of that exists on this
 * repository at all.
 */
import { PUBLIC_ROUTES, SITE_URL } from '$lib/content';
import { LOCALES, localizedPath } from '$lib/i18n';
import type { RequestHandler } from './$types';

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;');
}

export const GET: RequestHandler = () => {
	const urls = PUBLIC_ROUTES.flatMap((route) =>
		LOCALES.map((locale) => `${SITE_URL}${localizedPath(route, locale)}`)
	);
	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
		'</urlset>',
		''
	].join('\n');

	return new Response(body, {
		headers: { 'content-type': 'application/xml', 'cache-control': 'public, max-age=3600' }
	});
};
