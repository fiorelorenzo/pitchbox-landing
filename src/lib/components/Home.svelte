<script lang="ts">
	/**
	 * The one page this version ships (#422), rendered once per locale by
	 * `/+page.svelte` and `/it/+page.svelte`. Everything it shows is settled by #423's
	 * approved brief: the hero claims the human-in-the-loop boundary with the category
	 * in the subhead, one section states the boundary plainly, two ways to run it
	 * follow, and the footer links out. No pricing table, no testimonials, no
	 * screenshots yet - those are #425's.
	 */
	import { PUBLIC_SIGNUP_OPEN } from '$env/static/public';
	import { APP_URL, CONTENT, DOCS_URL, GITHUB_URL } from '$lib/content';
	import { primaryCta, secondaryCta } from '$lib/cta';
	import type { Locale } from '$lib/i18n';
	import Cta from './Cta.svelte';

	let { locale }: { locale: Locale } = $props();

	let t = $derived(CONTENT[locale]);
	let signupOpen = $derived(PUBLIC_SIGNUP_OPEN === 'true');
	let primary = $derived(primaryCta(locale, signupOpen));
	let secondary = $derived(secondaryCta(locale));
</script>

<svelte:head>
	<title>{t.title}</title>
	<meta name="description" content={t.description} />
</svelte:head>

<main id="main" class="mx-auto max-w-3xl px-6 pt-16 pb-24">
	<!-- Hero (#423, decided 2026-09-09): the trust framing carries the boundary claim,
	     the subhead carries the category and the four platforms. Sized against the
	     Italian string, which runs longer, so both languages hold at every width. -->
	<section class="flex flex-col gap-6">
		<h1 class="text-4xl font-semibold text-balance text-foreground sm:text-5xl">
			{t.hero.heading}
		</h1>
		<p class="max-w-xl text-lg text-muted-foreground">
			{t.hero.subhead}
		</p>
		<div class="mt-2 flex flex-wrap items-center gap-4">
			<Cta cta={primary} variant="primary" />
			<Cta cta={secondary} variant="secondary" />
		</div>
	</section>

	<!-- The boundary, as its own section rather than a footnote (#423's story, step 4). -->
	<section class="mt-20 border-t border-border pt-12">
		<h2 class="text-2xl font-semibold text-foreground">{t.boundary.heading}</h2>
		<ul class="mt-6 flex flex-col gap-4">
			{#each t.boundary.items as item (item)}
				<li class="flex gap-3 text-base text-foreground">
					<span aria-hidden="true" class="mt-1 text-muted-foreground">-</span>
					<span>{item}</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Two ways to run it (#423's story, step 5): self-host and the cloud edition,
	     named without a price - there is no billing, no plan, and this version does
	     not pretend otherwise. -->
	<section class="mt-20 border-t border-border pt-12">
		<h2 class="text-2xl font-semibold text-foreground">{t.ways.heading}</h2>
		<div class="mt-6 grid gap-8 sm:grid-cols-2">
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="text-lg font-semibold text-card-foreground">{t.ways.selfHost.heading}</h3>
				<p class="mt-2 text-sm text-muted-foreground">{t.ways.selfHost.body}</p>
			</div>
			<div class="rounded-lg border border-border bg-card p-6">
				<h3 class="text-lg font-semibold text-card-foreground">{t.ways.cloud.heading}</h3>
				<p class="mt-2 text-sm text-muted-foreground">{t.ways.cloud.body}</p>
			</div>
		</div>
	</section>

	<!-- APP_URL, DOCS_URL and GITHUB_URL ($lib/content.ts) are always absolute https://
	     URLs to other hosts, never internal routes, so they need no resolve(). -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<footer
		class="mt-20 flex flex-wrap gap-6 border-t border-border pt-8 text-sm text-muted-foreground"
	>
		<a href={APP_URL} class="hover:text-foreground hover:underline">{t.footer.app}</a>
		<a href={DOCS_URL} class="hover:text-foreground hover:underline">{t.footer.docs}</a>
		<a href={GITHUB_URL} class="hover:text-foreground hover:underline">{t.footer.github}</a>
	</footer>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</main>
