import { describe, expect, it } from 'vitest';
import snapshot from './plan-snapshot.json';
import {
	annualSavingsPercent,
	formatCount,
	formatEurWhole,
	formatUsdWhole,
	planById,
	PLAN_IDS,
	type PlanCatalogueSnapshot
} from './plans';

/**
 * `docs/design/DECISIONS.md` D24/D26 (product repository): this repo carries no
 * hand-typed second copy of the plan catalogue. `plan-snapshot.json` is a pinned
 * copy of the product's `docs/plan-catalogue.json`, itself generated there from
 * `listPlans()` - and this file is what stops the pricing page's numbers drifting
 * from that snapshot the moment someone edits a display string without checking
 * it against the data. It never fetches anything; `pnpm run plans:refresh`
 * (`scripts/refresh-plans.mjs`) is the deliberate, human-run step that pulls the
 * live artifact and rewrites the pinned copy for review.
 */
const catalogue = snapshot as PlanCatalogueSnapshot;

describe('plan-snapshot.json', () => {
	it('carries all four plans, in ladder order', () => {
		expect(catalogue.plans.map((p) => p.id)).toEqual(PLAN_IDS);
	});
});

describe('formatEurWhole/formatUsdWhole', () => {
	it('renders every paid plan price as the whole-euro figure docs/billing.md publishes', () => {
		expect(formatEurWhole(planById(catalogue, 'solo').monthlyPriceCents!, 'en')).toBe('€29');
		expect(formatEurWhole(planById(catalogue, 'growth').monthlyPriceCents!, 'en')).toBe('€79');
		expect(formatEurWhole(planById(catalogue, 'scale').monthlyPriceCents!, 'en')).toBe('€199');
		expect(formatEurWhole(planById(catalogue, 'solo').annualPriceCents!, 'en')).toBe('€290');
		expect(formatEurWhole(planById(catalogue, 'growth').annualPriceCents!, 'en')).toBe('€790');
		expect(formatEurWhole(planById(catalogue, 'scale').annualPriceCents!, 'en')).toBe('€1,990');
	});

	it('renders the USD headline at numeric parity with EUR, not a converted amount', () => {
		for (const id of ['solo', 'growth', 'scale'] as const) {
			const plan = planById(catalogue, id);
			const eur = formatEurWhole(plan.monthlyPriceCents!, 'en').replace('€', '');
			const usd = formatUsdWhole(plan.monthlyPriceCents!, 'en').replace('$', '').replace('US$', '');
			expect(usd).toBe(eur);
		}
	});
});

describe('annualSavingsPercent', () => {
	it('is derived from the two catalogue prices, not a hand-typed figure', () => {
		for (const id of ['solo', 'growth', 'scale'] as const) {
			const plan = planById(catalogue, id);
			// Ten months of the monthly price (docs/billing.md: "two months free"),
			// so annual is 10/12 of twelve months at the monthly rate - about 16.7%,
			// not the "20 percent" a page that never checked the catalogue might guess.
			expect(annualSavingsPercent(plan)).toBe(
				Math.round((1 - plan.annualPriceCents! / (plan.monthlyPriceCents! * 12)) * 100)
			);
			expect(annualSavingsPercent(plan)).toBe(17);
		}
	});

	it('is null for the free plan, which has no price to save against', () => {
		expect(annualSavingsPercent(planById(catalogue, 'free'))).toBeNull();
	});
});

describe('formatCount', () => {
	it('reads every unlimited field in the snapshot as "Unlimited"/"Illimitati", never a number', () => {
		const growth = planById(catalogue, 'growth');
		expect(growth.accounts).toBeNull();
		expect(formatCount(growth.accounts, 'en')).toBe('Unlimited');
		expect(formatCount(growth.accounts, 'it')).toBe('Illimitati');
	});

	it('renders a real limit with locale-appropriate grouping, from the snapshot value itself', () => {
		const scale = planById(catalogue, 'scale');
		expect(scale.runsPerMonth).toBe(8000);
		expect(formatCount(scale.runsPerMonth, 'en')).toBe('8,000');
		// it-IT's CLDR data groups from 10,000 (minimumGroupingDigits: 2), so a
		// four-digit count renders with no separator - this is Intl's real output,
		// not a bug in the formatter; a million-scale count does get one.
		expect(formatCount(scale.runsPerMonth, 'it')).toBe('8000');
		expect(formatCount(8_000_000, 'it')).toBe('8.000.000');
	});
});
