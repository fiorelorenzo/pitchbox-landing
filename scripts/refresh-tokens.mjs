#!/usr/bin/env node
/**
 * Deliberate refresh for the token-drift guard (#425, D24 in the product
 * repository's `docs/design/DECISIONS.md`): pulls `web/src/app.css` from
 * `pitchbox`'s `main` on GitHub, re-derives the `:root`/`.dark` custom-property
 * blocks, and rewrites `src/lib/token-snapshot.json` - the pinned copy
 * `src/lib/token-drift.test.ts` checks `src/app.css` against offline, with no
 * network call of its own.
 *
 * Run this on purpose (`pnpm run tokens:refresh`) after a real change to the
 * product's token layer. It prints what changed since the last refresh; review
 * that, update `src/app.css` to match if any value moved, and commit both files
 * together. The test only catches this repo's `src/app.css` drifting from the
 * pinned snapshot - it cannot catch the snapshot itself going stale relative to
 * upstream, which is exactly this script's job and why it is not wired into CI.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE_URL = 'https://raw.githubusercontent.com/fiorelorenzo/pitchbox/main/web/src/app.css';
const repoRoot = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const snapshotPath = `${repoRoot}/src/lib/token-snapshot.json`;

/**
 * Every `--token: value` declaration inside the first block whose selector list
 * contains `selector`, in source order. Mirrors `token-drift.test.ts`'s own
 * parser - both are short enough that keeping two copies in eye-sync reads
 * better than an import across the test/script build boundary.
 */
function declarations(css, selector) {
	const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const [, prelude, body] of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const selectors = prelude.slice(prelude.lastIndexOf(';') + 1);
		const names = selectors
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!names.includes(selector)) continue;
		const out = {};
		for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
			out[name] = value.trim().replace(/\s+/g, ' ');
		}
		if (Object.keys(out).length > 0) return out;
	}
	throw new Error(`no block with selector ${selector} carrying custom properties`);
}

function printDiff(label, before, after) {
	const beforeKeys = new Set(Object.keys(before));
	const afterKeys = new Set(Object.keys(after));
	const lines = [];
	for (const key of afterKeys) {
		if (!beforeKeys.has(key)) lines.push(`  + ${key}: ${after[key]}`);
		else if (before[key] !== after[key]) lines.push(`  ~ ${key}: ${before[key]} -> ${after[key]}`);
	}
	for (const key of beforeKeys) {
		if (!afterKeys.has(key)) lines.push(`  - ${key}: ${before[key]}`);
	}
	console.log(lines.length === 0 ? `${label}: no change` : `${label}:\n${lines.join('\n')}`);
}

const response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(15_000) });
if (!response.ok) {
	throw new Error(`could not fetch ${SOURCE_URL}: HTTP ${response.status}`);
}
const sourceCss = await response.text();

const light = declarations(sourceCss, ':root');
const dark = declarations(sourceCss, '.dark');

const previous = existsSync(snapshotPath)
	? JSON.parse(readFileSync(snapshotPath, 'utf8'))
	: { light: {}, dark: {} };

printDiff('light (:root)', previous.light ?? {}, light);
printDiff('dark (.dark)', previous.dark ?? {}, dark);

const snapshot = {
	sourceUrl: SOURCE_URL,
	refreshedAt: new Date().toISOString().slice(0, 10),
	light,
	dark
};
writeFileSync(snapshotPath, `${JSON.stringify(snapshot, null, '\t')}\n`);
console.log(`\nWrote ${snapshotPath}.${lines_hint(previous, { light, dark })}`);

function lines_hint(previous, next) {
	const changed =
		JSON.stringify(previous.light) !== JSON.stringify(next.light) ||
		JSON.stringify(previous.dark) !== JSON.stringify(next.dark);
	return changed
		? ' Something changed above - update src/app.css to match before committing.'
		: ' No drift; src/app.css needs no change.';
}
