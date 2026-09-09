import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import snapshot from './token-snapshot.json';

/**
 * `docs/design/DECISIONS.md` D24 (product repository): this landing's token layer
 * (`src/app.css`) is a verbatim copy of `pitchbox`'s `web/src/app.css`, and the
 * decision was to check that copy rather than carry a third, unlabelled copy - the
 * weaker half of the reference `canonry-landing` set (#425).
 *
 * The mechanism is pinned expected values, not a live fetch. An earlier version of
 * this test called `fetch()` against `raw.githubusercontent.com` in `beforeAll`, which
 * traded "checked against the source of truth" for "red whenever GitHub has a bad
 * minute or rate-limits CI" - a guard whose failure mode is indistinguishable from an
 * unrelated PR being broken is not a guard anyone keeps trusting. This version reads
 * `src/lib/token-snapshot.json`, a pinned copy of the product's `:root`/`.dark`
 * declarations committed in this repo, and compares `src/app.css` against it entirely
 * offline: it fails on a real drift between the two files in this repo and never on a
 * network condition, because there is no network involved.
 *
 * The snapshot goes stale on its own the moment the product's tokens change and nobody
 * tells this repo - that gap is deliberate, not missed. Closing it is `pnpm run
 * tokens:refresh` (`scripts/refresh-tokens.mjs`), which someone runs on purpose, pulls
 * `web/src/app.css` from `pitchbox` on GitHub, prints what changed since the last
 * refresh, and rewrites the snapshot for review before committing.
 *
 * Unlike the extension (which omits some tokens and adds its own, D2), this file is a
 * complete, unmodified copy of both the light (`:root`) and dark (`.dark`) blocks -
 * `src/app.css`'s own header comment says so - so every token on either side is
 * expected to match exactly, with no allowed omissions or additions.
 */

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Every `--token: value` declaration inside the first block whose selector list
 * contains `selector`, in source order. Mirrors the product repository's own parser
 * (`shared/tests/token-drift.test.ts`) and `scripts/refresh-tokens.mjs`'s copy, so all
 * three stay easy to compare by eye.
 */
function declarations(css: string, selector: string): Map<string, string> {
	const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const [, prelude, body] of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const selectors = prelude.slice(prelude.lastIndexOf(';') + 1);
		const names = selectors
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!names.includes(selector)) continue;
		const out = new Map<string, string>();
		for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
			out.set(name, value.trim().replace(/\s+/g, ' '));
		}
		if (out.size > 0) return out;
	}
	throw new Error(`no block with selector ${selector} carrying custom properties`);
}

const landingCss = readFileSync(`${repoRoot}/src/app.css`, 'utf8');

describe.each([
	['light', ':root', snapshot.light],
	['dark', '.dark', snapshot.dark]
])('%s token block', (_name, selector, pinned) => {
	it('matches the pinned snapshot of pitchbox/web/src/app.css, token for token', () => {
		const landing = declarations(landingCss, selector);

		// Guards the parser itself: a regex that silently matched nothing would make
		// the equality assertion below pass on two empty objects.
		expect(Object.keys(pinned).length).toBeGreaterThan(15);

		const landingEntries = Object.fromEntries(landing);
		expect(landingEntries).toEqual(pinned);
	});
});
