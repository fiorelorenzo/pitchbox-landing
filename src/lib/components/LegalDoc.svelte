<script lang="ts">
	/**
	 * Renders one legal document (privacy or terms) for one locale, from
	 * `$lib/legal.ts`. Deliberately plain: a legal page is read, and occasionally
	 * printed, so it gets one column, real headings a screen reader can navigate, and
	 * no cards or columns to break the reading order.
	 */
	import { resolve } from '$app/paths';
	import { ENTITY_LABELS, LEGAL_ENTITY } from '$lib/legal-entity';
	import { LEGAL, SUPPORT_EMAIL } from '$lib/legal';
	import type { Locale } from '$lib/i18n';
	import Seo from './Seo.svelte';

	let { locale, doc }: { locale: Locale; doc: 'privacy' | 'terms' } = $props();

	let t = $derived(LEGAL[locale]);
	let content = $derived(t[doc]);
	let labels = $derived(ENTITY_LABELS[locale]);
	let home = $derived(locale === 'en' ? resolve('/') : resolve('/it'));
</script>

<Seo {locale} path="/{doc}" title={content.title} description={content.description} />

<svelte:head>
	<title>{content.title}</title>
	<meta name="description" content={content.description} />
</svelte:head>

<main id="main" class="mx-auto max-w-3xl px-6 pt-16 pb-24">
	<h1 class="text-3xl font-semibold text-foreground sm:text-4xl">{content.heading}</h1>
	<p class="mt-3 text-sm text-muted-foreground">
		{t.updatedLabel}: {content.updated}
	</p>

	<!-- The identification block. `LEGAL_ENTITY.address` and `.vat` are null unless the
	     deploy sets PUBLIC_LEGAL_ADDRESS / PUBLIC_LEGAL_VAT ($lib/legal-entity.ts). -->
	<dl class="mt-8 grid gap-2 border-y border-border py-6 text-sm sm:grid-cols-[10rem_1fr]">
		<dt class="text-muted-foreground">{labels.operator}</dt>
		<dd class="text-foreground">{LEGAL_ENTITY.name}</dd>
		{#if LEGAL_ENTITY.address}
			<dt class="text-muted-foreground">{labels.address}</dt>
			<dd class="text-foreground">{LEGAL_ENTITY.address}</dd>
		{/if}
		{#if LEGAL_ENTITY.vat}
			<dt class="text-muted-foreground">{labels.vat}</dt>
			<dd class="text-foreground">{LEGAL_ENTITY.vat}</dd>
		{/if}
		<dt class="text-muted-foreground">Email</dt>
		<dd class="text-foreground">
			<a class="hover:underline" href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>
		</dd>
	</dl>

	{#each content.sections as section (section.heading)}
		<section class="mt-12">
			<h2 class="text-xl font-semibold text-foreground">{section.heading}</h2>
			{#each section.body as paragraph (paragraph)}
				<p class="mt-4 text-base text-muted-foreground">{paragraph}</p>
			{/each}
			{#if section.bullets}
				<ul class="mt-4 flex list-disc flex-col gap-3 pl-5 marker:text-muted-foreground">
					{#each section.bullets as bullet (bullet)}
						<li class="text-base text-muted-foreground">{bullet}</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}

	<footer class="mt-16 border-t border-border pt-8 text-sm text-muted-foreground">
		<a href={home} class="hover:text-foreground hover:underline">{t.backToHome}</a>
	</footer>
</main>
