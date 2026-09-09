<script lang="ts">
	/**
	 * The pricing page (#558): four plans, a monthly/annual toggle, one CTA per
	 * paid column carrying `plan`/`interval` into registration, and the three
	 * paragraphs the issue asked for (what is metered and what happens at a
	 * limit, what Managed Payments means for the buyer, that self-hosting stays
	 * free and unlimited). Every number rendered here traces to
	 * `$lib/plan-snapshot.json` through `$lib/plans.ts`'s formatters - never a
	 * literal typed in this file (`plan-catalogue.test.ts` is what checks that
	 * for the underlying data; nothing here restates a price or a limit by hand).
	 */
	import { PUBLIC_SIGNUP_OPEN } from '$env/static/public';
	import { APP_URL, CONTENT, DOCS_URL, GITHUB_URL } from '$lib/content';
	import { planCta, primaryCta, secondaryCta } from '$lib/cta';
	import {
		annualSavingsPercent,
		formatCount,
		formatEurWhole,
		planById,
		type PlanCatalogueSnapshot,
		type PlanDefinition,
		type PlanId
	} from '$lib/plans';
	import { PRICING_CONTENT } from '$lib/pricing-copy';
	import { resolve } from '$app/paths';
	import type { Locale } from '$lib/i18n';
	import snapshotJson from '$lib/plan-snapshot.json';
	import Cta from './Cta.svelte';
	import Seo from './Seo.svelte';

	let { locale }: { locale: Locale } = $props();

	const snapshot = snapshotJson as PlanCatalogueSnapshot;
	const PAID_PLAN_IDS: Exclude<PlanId, 'free'>[] = ['solo', 'growth', 'scale'];

	let nav = $derived(CONTENT[locale]);
	let t = $derived(PRICING_CONTENT[locale]);
	let signupOpen = $derived(PUBLIC_SIGNUP_OPEN === 'true');
	let interval = $state<'month' | 'year'>('month');

	let free = $derived(planById(snapshot, 'free'));
	let freeCta = $derived(primaryCta(locale, signupOpen));
	let selfHostCta = $derived(secondaryCta(locale));

	function priceCents(plan: PlanDefinition): number | null {
		return interval === 'month' ? plan.monthlyPriceCents : plan.annualPriceCents;
	}

	function featureRows(plan: PlanDefinition): Array<{ label: string; value: string }> {
		return [
			{ label: t.featureLabels.projects, value: formatCount(plan.projects, locale) },
			{ label: t.featureLabels.runsPerMonth, value: formatCount(plan.runsPerMonth, locale) },
			{
				label: t.featureLabels.suggestionsPerMonth,
				value: formatCount(plan.suggestionsPerMonth, locale)
			},
			{ label: t.featureLabels.seats, value: formatCount(plan.seats, locale) },
			{ label: t.featureLabels.accounts, value: formatCount(plan.accounts, locale) },
			{
				label: t.featureLabels.extensionDevices,
				value: formatCount(plan.extensionDevices, locale)
			},
			{
				label: t.featureLabels.maxConcurrentRuns,
				value: formatCount(plan.maxConcurrentRuns, locale)
			},
			{
				label: t.featureLabels.monthlyRunBudgetUsd(`$${plan.monthlyRunBudgetUsd}`),
				value: ''
			},
			{ label: t.featureLabels.retentionDays(String(plan.retentionDays)), value: '' },
			{
				label: t.featureLabels.premiumModels,
				value: plan.premiumModels ? '✓' : '—'
			},
			{ label: t.featureLabels.webhooks, value: plan.webhooks ? '✓' : '—' }
		];
	}

	let privacyHref = $derived(locale === 'en' ? resolve('/privacy') : resolve('/it/privacy'));
	let termsHref = $derived(locale === 'en' ? resolve('/terms') : resolve('/it/terms'));
</script>

<Seo {locale} path="/pricing" title={t.title} description={t.description} />

<svelte:head>
	<title>{t.title}</title>
	<meta name="description" content={t.description} />
</svelte:head>

<main id="main" class="mx-auto max-w-6xl px-6 pt-16 pb-24">
	<section class="flex flex-col gap-4">
		<h1 class="text-4xl font-semibold text-balance text-foreground sm:text-5xl">{t.heading}</h1>
		<p class="max-w-2xl text-lg text-muted-foreground">{t.subhead}</p>
	</section>

	<div
		role="group"
		aria-label={`${t.billingToggle.monthly} / ${t.billingToggle.annual}`}
		class="mt-8 inline-flex gap-1 rounded-lg border border-border bg-card p-1"
	>
		<button
			type="button"
			aria-pressed={interval === 'month'}
			onclick={() => (interval = 'month')}
			class="rounded-md px-4 py-2 text-sm font-medium {interval === 'month'
				? 'bg-primary text-primary-foreground'
				: 'text-muted-foreground hover:text-foreground'}"
		>
			{t.billingToggle.monthly}
		</button>
		<button
			type="button"
			aria-pressed={interval === 'year'}
			onclick={() => (interval = 'year')}
			class="rounded-md px-4 py-2 text-sm font-medium {interval === 'year'
				? 'bg-primary text-primary-foreground'
				: 'text-muted-foreground hover:text-foreground'}"
		>
			{t.billingToggle.annual}
		</button>
	</div>

	<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
		<!-- Free: no Checkout to preselect, so its CTA is the plain primary one -
		     the same registration button the home page offers. -->
		<div class="flex flex-col rounded-lg border border-border bg-card p-6">
			<h2 class="text-lg font-semibold text-card-foreground">{free.name}</h2>
			<p class="mt-4 text-3xl font-semibold text-foreground">{t.freePriceLabel}</p>
			<div class="mt-6">
				<Cta cta={freeCta} variant="secondary" />
			</div>
			<dl class="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-sm">
				{#each featureRows(free) as row (row.label)}
					<div class="flex items-baseline justify-between gap-4">
						<dt class="text-muted-foreground">{row.label}</dt>
						{#if row.value}<dd class="font-medium text-foreground">{row.value}</dd>{/if}
					</div>
				{/each}
			</dl>
		</div>

		{#each PAID_PLAN_IDS as planId (planId)}
			{@const plan = planById(snapshot, planId)}
			{@const cents = priceCents(plan)}
			{@const savings = annualSavingsPercent(plan)}
			<div class="flex flex-col rounded-lg border border-border bg-card p-6">
				<h2 class="text-lg font-semibold text-card-foreground">{plan.name}</h2>
				<p class="mt-4 text-3xl font-semibold text-foreground">
					{cents !== null ? formatEurWhole(cents, locale) : ''}
					<span class="text-base font-normal text-muted-foreground">
						{interval === 'month' ? t.priceSuffix.monthly : t.priceSuffix.annual}
					</span>
				</p>
				{#if interval === 'year' && savings !== null}
					<p class="mt-1 text-xs font-medium text-link">{t.billingToggle.annualBadge(savings)}</p>
				{/if}
				<div class="mt-6">
					<Cta cta={planCta(locale, signupOpen, planId, plan.name, interval)} variant="primary" />
				</div>
				<dl class="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-sm">
					{#each featureRows(plan) as row (row.label)}
						<div class="flex items-baseline justify-between gap-4">
							<dt class="text-muted-foreground">{row.label}</dt>
							{#if row.value}<dd class="font-medium text-foreground">{row.value}</dd>{/if}
						</div>
					{/each}
				</dl>
			</div>
		{/each}
	</div>

	<p class="mt-6 text-sm text-muted-foreground">{t.taxNote}</p>

	<section class="mt-20 border-t border-border pt-12">
		<h2 class="text-2xl font-semibold text-foreground">{t.metering.heading}</h2>
		<div class="mt-4 flex flex-col gap-3">
			{#each t.metering.body as paragraph (paragraph)}
				<p class="text-base text-muted-foreground">{paragraph}</p>
			{/each}
		</div>
	</section>

	<section class="mt-20 border-t border-border pt-12">
		<h2 class="text-2xl font-semibold text-foreground">{t.managedPayments.heading}</h2>
		<div class="mt-4 flex flex-col gap-3">
			{#each t.managedPayments.body as paragraph (paragraph)}
				<p class="text-base text-muted-foreground">{paragraph}</p>
			{/each}
		</div>
	</section>

	<section class="mt-20 border-t border-border pt-12">
		<div class="rounded-lg border border-border bg-card p-6">
			<h2 class="text-lg font-semibold text-card-foreground">{t.selfHost.heading}</h2>
			<p class="mt-2 text-sm text-muted-foreground">{t.selfHost.body}</p>
			<div class="mt-4">
				<Cta cta={selfHostCta} variant="secondary" />
			</div>
		</div>
	</section>

	<!-- APP_URL, DOCS_URL and GITHUB_URL ($lib/content.ts) are always absolute https://
	     URLs to other hosts, never internal routes, so they need no resolve(). -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<footer
		class="mt-20 flex flex-wrap gap-6 border-t border-border pt-8 text-sm text-muted-foreground"
	>
		<a href={APP_URL} class="hover:text-foreground hover:underline">{nav.footer.app}</a>
		<a href={DOCS_URL} class="hover:text-foreground hover:underline">{nav.footer.docs}</a>
		<a href={GITHUB_URL} class="hover:text-foreground hover:underline">{nav.footer.github}</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
		<a href={privacyHref} class="hover:text-foreground hover:underline">{nav.footer.privacy}</a>
		<a href={termsHref} class="hover:text-foreground hover:underline">{nav.footer.terms}</a>
	</footer>
</main>
