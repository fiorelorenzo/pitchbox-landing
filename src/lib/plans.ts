/**
 * Types and pure formatting helpers for the pricing page (#558). Mirrors the shape
 * of `PlanDefinition` from the product repository's `shared/src/plans.ts`, but
 * carries no numbers of its own: every value a caller reads through these types
 * comes from `$lib/plan-snapshot.json`, a generated artifact refreshed on purpose
 * (`pnpm run plans:refresh`, `scripts/refresh-plans.mjs`) rather than a second,
 * hand-typed copy of the catalogue - the drift `docs/design/DECISIONS.md` D24/D26
 * (product repository) exist to rule out. `null` on a numeric field means
 * unlimited, the same convention the product repository's `Entitlements` type
 * uses - there is no second sentinel here either.
 */
import type { Locale } from './i18n';

export const PLAN_IDS = ['free', 'solo', 'growth', 'scale'] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export interface PlanDefinition {
	id: PlanId;
	name: string;
	monthlyPriceCents: number | null;
	annualPriceCents: number | null;
	runsPerMonth: number | null;
	suggestionsPerMonth: number | null;
	projects: number | null;
	accounts: number | null;
	seats: number | null;
	extensionDevices: number | null;
	maxConcurrentRuns: number | null;
	monthlyRunBudgetUsd: number | null;
	retentionDays: number | null;
	premiumModels: boolean;
	webhooks: boolean;
}

export interface PlanCatalogueSnapshot {
	sourceUrl: string;
	refreshedAt: string;
	schemaVersion: number;
	plans: PlanDefinition[];
}

function intlLocale(locale: Locale): string {
	return locale === 'it' ? 'it-IT' : 'en-US';
}

/** A whole-euro price from minor units - every headline price in the catalogue is
 * a round euro amount, so there is never a fractional cent to show. `null` reads
 * as "no price" (Free), not "€0"; a caller decides what to say for that case. */
export function formatEurWhole(cents: number, locale: Locale): string {
	return new Intl.NumberFormat(intlLocale(locale), {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 0
	}).format(cents / 100);
}

/** The same headline number in USD (docs/billing.md: "USD stays at numeric
 * parity" - $29/$79/$199, deliberately not the converted euro amount). */
export function formatUsdWhole(cents: number, locale: Locale): string {
	return new Intl.NumberFormat(intlLocale(locale), {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	}).format(cents / 100);
}

/** `null` (unlimited) reads as the locale's own word; a real number gets
 * thousands separators. */
export function formatCount(value: number | null, locale: Locale): string {
	if (value === null) return locale === 'it' ? 'Illimitati' : 'Unlimited';
	return new Intl.NumberFormat(intlLocale(locale)).format(value);
}

/** Whole percent saved by paying annually instead of twelve months at the
 * monthly price, computed from the two catalogue prices themselves - never a
 * hand-typed "20%" that could quietly stop matching them, which is the exact
 * failure mode #558 exists to close off. `null` when the plan has no price. */
export function annualSavingsPercent(plan: PlanDefinition): number | null {
	if (plan.monthlyPriceCents === null || plan.annualPriceCents === null) return null;
	const fullYear = plan.monthlyPriceCents * 12;
	if (fullYear === 0) return null;
	return Math.round((1 - plan.annualPriceCents / fullYear) * 100);
}

export function planById(snapshot: PlanCatalogueSnapshot, id: PlanId): PlanDefinition {
	const plan = snapshot.plans.find((p) => p.id === id);
	if (!plan) throw new Error(`plan-snapshot.json carries no plan named ${id}`);
	return plan;
}
