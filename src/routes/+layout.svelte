<script lang="ts">
	/**
	 * Chrome that appears on every route: the skip link, the wordmark, and the
	 * language switch. `locale` is read from the URL path (`$lib/i18n`) - `/` is
	 * English, `/it` is Italian - and the switch below always points at the other
	 * locale's home, since this version has exactly one page per language (#422; the
	 * rest of the story is #425). Clicking it also writes `LOCALE_COOKIE` (LOR-225):
	 * `src/hooks.server.ts` reads that back on the next visit to a bare entry path,
	 * so a visitor who explicitly picked a language keeps it even when their
	 * browser's `Accept-Language` disagrees.
	 */
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { localeFromPathname, LOCALE_COOKIE, type Locale } from '$lib/i18n';
	import { CONTENT } from '$lib/content';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let locale = $derived<Locale>(localeFromPathname(page.url.pathname));
	let t = $derived(CONTENT[locale].nav);
	let otherLocale = $derived<Locale>(locale === 'en' ? 'it' : 'en');
	let otherLocaleHref = $derived(locale === 'en' ? resolve('/it') : resolve('/'));

	/** One year, `path=/` so it applies to both `/` and `/it`, `SameSite=Lax` so it
	 * still rides along on the plain top-level navigation this link performs. */
	function rememberLanguage() {
		document.cookie = `${LOCALE_COOKIE}=${otherLocale}; path=/; max-age=31536000; samesite=lax`;
	}
</script>

<a
	href="#main"
	class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
>
	{t.skipToContent}
</a>

<header class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 pt-8">
	<a
		href={locale === 'en' ? resolve('/') : resolve('/it')}
		class="text-lg font-semibold text-foreground"
	>
		{t.wordmark}
	</a>
	<nav class="flex items-center gap-6">
		<a
			href={locale === 'en' ? resolve('/pricing') : resolve('/it/pricing')}
			class="text-sm text-muted-foreground hover:text-foreground hover:underline"
		>
			{t.pricing}
		</a>
		<a
			href={otherLocaleHref}
			onclick={rememberLanguage}
			class="text-sm text-muted-foreground hover:text-foreground hover:underline"
		>
			{t.switchLanguage}
		</a>
	</nav>
</header>

{@render children()}
