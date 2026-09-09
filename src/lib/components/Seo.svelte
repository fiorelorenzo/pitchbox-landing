<script lang="ts">
	/**
	 * Per-page metadata (#426): title and description are still the caller's own
	 * `<svelte:head>` concern (they serve the browser tab, same reasoning the app
	 * repository gave for keeping its own on `app.pitchbox.app`, #426's first comment),
	 * but everything a crawler or an unfurling bot reads - the canonical URL, the
	 * `en`/`it`/`x-default` alternate links, `og:*` and `twitter:*` - lives here so a
	 * new page cannot ship without it and two pages cannot disagree on the shape.
	 *
	 * `path` is locale-neutral and always starts with `/` (`'/'`, `'/privacy'`,
	 * `'/terms'`): this component derives both locales' real URLs from it rather than
	 * taking them as separate props, so the `/it` prefix rule lives in exactly one
	 * place ($lib/i18n's own rule, mirrored here).
	 */
	import { OG_LOCALE, localizedPath, type Locale } from '$lib/i18n';
	import { SITE_URL } from '$lib/content';

	let {
		locale,
		path,
		title,
		description,
		image
	}: {
		locale: Locale;
		path: string;
		title: string;
		description: string;
		/** Absolute URL. Defaults to the shared per-locale card in `static/og/`. */
		image?: string;
	} = $props();

	let enUrl = $derived(`${SITE_URL}${localizedPath(path, 'en')}`);
	let itUrl = $derived(`${SITE_URL}${localizedPath(path, 'it')}`);
	let canonical = $derived(locale === 'it' ? itUrl : enUrl);
	let otherLocale = $derived<Locale>(locale === 'it' ? 'en' : 'it');
	let ogImage = $derived(image ?? `${SITE_URL}/og/og-${locale}.png`);
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
	<link rel="alternate" hreflang="en" href={enUrl} />
	<link rel="alternate" hreflang="it" href={itUrl} />
	<link rel="alternate" hreflang="x-default" href={enUrl} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Pitchbox" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content={OG_LOCALE[locale]} />
	<meta property="og:locale:alternate" content={OG_LOCALE[otherLocale]} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
