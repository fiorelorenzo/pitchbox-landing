#!/usr/bin/env node
/**
 * Deliberate refresh for the pricing page's catalogue snapshot (#558,
 * docs/design/DECISIONS.md D24/D26 in the product repository): pulls
 * `docs/plan-catalogue.json` from `pitchbox`'s `main` on GitHub - itself
 * generated there by `scripts/export-plan-catalogue.ts` from `listPlans()`,
 * never hand-typed - and rewrites `src/lib/plan-snapshot.json`, the pinned
 * copy `$lib/plans.ts`'s consumers (the pricing page, its drift test) read
 * entirely offline.
 *
 * Run this on purpose (`pnpm run plans:refresh`) after a real change to the
 * product's plan catalogue. It prints what changed since the last refresh;
 * review that before committing - a number moving here is exactly the signal
 * this script exists to surface.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE_URL =
	'https://raw.githubusercontent.com/fiorelorenzo/pitchbox/main/docs/plan-catalogue.json';
const repoRoot = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const snapshotPath = `${repoRoot}/src/lib/plan-snapshot.json`;

function printDiff(previousPlans, nextPlans) {
	const byId = (plans) => new Map(plans.map((p) => [p.id, p]));
	const before = byId(previousPlans);
	const after = byId(nextPlans);
	const lines = [];
	for (const [id, plan] of after) {
		const prior = before.get(id);
		if (!prior) {
			lines.push(`  + ${id}: added`);
			continue;
		}
		for (const key of Object.keys(plan)) {
			if (JSON.stringify(prior[key]) !== JSON.stringify(plan[key])) {
				lines.push(
					`  ~ ${id}.${key}: ${JSON.stringify(prior[key])} -> ${JSON.stringify(plan[key])}`
				);
			}
		}
	}
	for (const id of before.keys()) {
		if (!after.has(id)) lines.push(`  - ${id}: removed`);
	}
	console.log(lines.length === 0 ? 'no change' : lines.join('\n'));
}

const response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(15_000) });
if (!response.ok) {
	throw new Error(`could not fetch ${SOURCE_URL}: HTTP ${response.status}`);
}
const upstream = await response.json();
if (!Array.isArray(upstream.plans) || upstream.plans.length === 0) {
	throw new Error(`${SOURCE_URL} carried no plans array`);
}

const previous = existsSync(snapshotPath)
	? JSON.parse(readFileSync(snapshotPath, 'utf8'))
	: { plans: [] };

printDiff(previous.plans ?? [], upstream.plans);

const snapshot = {
	sourceUrl: SOURCE_URL,
	refreshedAt: new Date().toISOString().slice(0, 10),
	schemaVersion: upstream.schemaVersion ?? 1,
	plans: upstream.plans
};
writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, '\t')}\n`);
console.log(`\nWrote ${snapshotPath}.`);
