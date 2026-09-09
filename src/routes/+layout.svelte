<script lang="ts">
	/**
	 * Chrome that appears on every route: the skip link, the wordmark, and the
	 * language switch. `locale` is read from the URL path (`$lib/i18n`), never
	 * negotiated - `/` is English, `/it` is Italian, and the switch below always
	 * points at the other locale's home, since this version has exactly one page
	 * per language (#422; the rest of the story is #425).
	 */
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { localeFromPathname, type Locale } from '$lib/i18n';
	import { CONTENT } from '$lib/content';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	let locale = $derived<Locale>(localeFromPathname(page.url.pathname));
	let t = $derived(CONTENT[locale].nav);
	let otherLocaleHref = $derived(locale === 'en' ? resolve('/it') : resolve('/'));
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
			class="text-sm text-muted-foreground hover:text-foreground hover:underline"
		>
			{t.switchLanguage}
		</a>
	</nav>
</header>

{@render children()}
