<script lang="ts">
	/**
	 * The one page this version ships (#422/#425), rendered once per locale by
	 * `/+page.svelte` and `/it/+page.svelte`. Follows #423's approved brief's story in
	 * order: the hero claims the human-in-the-loop boundary with the category in the
	 * subhead, the loop and the in-page companion carry the real screenshots
	 * (`docs/screenshots.md`), the boundary states what it never does, two ways to run
	 * it follow, and the footer links out. Still no pricing table, no testimonials.
	 */
	import { PUBLIC_SIGNUP_OPEN } from '$env/static/public';
	import { APP_URL, CONTENT, DOCS_URL, GITHUB_URL } from '$lib/content';
	import { primaryCta, secondaryCta } from '$lib/cta';
	import { resolve } from '$app/paths';
	import type { Locale } from '$lib/i18n';
	import Cta from './Cta.svelte';
	import Seo from './Seo.svelte';

	let { locale }: { locale: Locale } = $props();

	let t = $derived(CONTENT[locale]);
	let signupOpen = $derived(PUBLIC_SIGNUP_OPEN === 'true');
	let primary = $derived(primaryCta(locale, signupOpen));
	let secondary = $derived(secondaryCta(locale));
	// The two legal pages live on this host, one pair per locale, so unlike the three
	// footer links above they are internal routes and do need resolve().
	let privacyHref = $derived(locale === 'en' ? resolve('/privacy') : resolve('/it/privacy'));
	let termsHref = $derived(locale === 'en' ? resolve('/terms') : resolve('/it/terms'));
	// The panel screenshot has the product's own copy baked into the pixels (the
	// drafted comment, the button labels), so unlike the two Inbox shots - whose
	// dashboard UI is English-only either way - it needs one file per locale.
	let panelShot = $derived(
		locale === 'it' ? '/screenshots/panel-it.webp' : '/screenshots/panel-en.webp'
	);
	let panelShotDims = $derived(locale === 'it' ? { w: 1024, h: 600 } : { w: 1024, h: 547 });
</script>

<Seo {locale} path="/" title={t.title} description={t.description} />

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
		{#if !signupOpen}
			<p class="max-w-xl text-sm text-muted-foreground">{t.hero.inviteNote}</p>
		{/if}
	</section>

	<!-- The loop (#423's story, steps 1-3): real screenshots of the real Inbox, not
	     mockups (`docs/screenshots.md`). `loading="lazy"` plus explicit width/height
	     on every image below the hero keeps a cold cache from waiting on them - the
	     hero itself ships no image at all. -->
	<section class="mt-20 border-t border-border pt-12">
		<h2 class="text-2xl font-semibold text-foreground">{t.loop.heading}</h2>
		<ol class="mt-6 flex flex-col gap-3">
			{#each t.loop.steps as step, i (step)}
				<li class="flex items-baseline gap-3 text-base text-foreground">
					<span class="text-sm font-semibold text-muted-foreground">{i + 1}</span>
					{step}
				</li>
			{/each}
		</ol>
		<div class="mt-8 grid gap-6 sm:grid-cols-2">
			<figure>
				<img
					src="/screenshots/inbox-draft.webp"
					alt={t.loop.draftShotAlt}
					width="1024"
					height="683"
					loading="lazy"
					decoding="async"
					class="w-full rounded-lg border border-border"
				/>
				<figcaption class="mt-2 text-sm text-muted-foreground">
					{t.loop.draftShotCaption}
				</figcaption>
			</figure>
			<figure>
				<img
					src="/screenshots/inbox-sent.webp"
					alt={t.loop.sentShotAlt}
					width="1024"
					height="683"
					loading="lazy"
					decoding="async"
					class="w-full rounded-lg border border-border"
				/>
				<figcaption class="mt-2 text-sm text-muted-foreground">{t.loop.sentShotCaption}</figcaption>
			</figure>
		</div>
	</section>

	<!-- The in-page companion (#423's story, step 3 of the narrative, step 2 of the
	     page): the panel is the one screenshot nobody else has, so it gets its own
	     section rather than a bullet, with the boundary stated next to it rather than
	     only in the section below. -->
	<section class="mt-20 border-t border-border pt-12">
		<h2 class="text-2xl font-semibold text-foreground">{t.companion.heading}</h2>
		<div class="mt-6 grid gap-8 sm:grid-cols-2 sm:items-center">
			<div class="flex flex-col gap-4">
				<p class="text-base text-foreground">{t.companion.body}</p>
				<p class="text-sm text-muted-foreground">{t.companion.boundary}</p>
			</div>
			<figure>
				<img
					src={panelShot}
					alt={t.companion.shotAlt}
					width={panelShotDims.w}
					height={panelShotDims.h}
					loading="lazy"
					decoding="async"
					class="w-full rounded-lg border border-border"
				/>
				<figcaption class="mt-2 text-sm text-muted-foreground">
					{t.companion.shotCaption}
				</figcaption>
			</figure>
		</div>
	</section>

	<!-- The boundary, as its own section rather than a footnote (#423's story, step 4). -->
	<section class="mt-20 border-t border-border pt-12">
		<h2 class="text-2xl font-semibold text-foreground">{t.boundary.heading}</h2>
		<ul class="mt-6 flex list-disc flex-col gap-4 pl-5 marker:text-muted-foreground">
			{#each t.boundary.items as item (item)}
				<li class="text-base text-foreground">{item}</li>
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
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
		<a href={privacyHref} class="hover:text-foreground hover:underline">{t.footer.privacy}</a>
		<a href={termsHref} class="hover:text-foreground hover:underline">{t.footer.terms}</a>
	</footer>
</main>
