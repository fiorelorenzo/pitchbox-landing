import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * `docs/design/DECISIONS.md` D24 (product repository): this landing's token layer
 * (`src/app.css`) is a verbatim copy of `pitchbox`'s `web/src/app.css`, and the
 * decision was to check that copy in this repo's own CI rather than carry a third,
 * unlabelled copy - the weaker half of the reference `canonry-landing` set (#425).
 *
 * The mechanism differs from `pitchbox/shared/tests/token-drift.test.ts` (which the
 * extension's copy uses, D2) only because this repository cannot read the source
 * file off local disk: it is a separate git repo with a separate deploy, so this test
 * fetches `web/src/app.css` from `main` on GitHub instead. That trades a local file
 * read for a network dependency in CI, which is the accepted cost of the "checked
 * against the source of truth" branch of #425's decision rather than the "deliberately
 * independent, and says so" one. A network failure here means the check could not run,
 * not that the tokens agree - it fails loudly rather than skipping quietly.
 *
 * Unlike the extension (which omits some tokens and adds its own, D2), this file is a
 * complete, unmodified copy of both the light (`:root`) and dark (`.dark`) blocks -
 * `src/app.css`'s own header comment says so - so every token on either side is
 * expected to match exactly, with no allowed omissions or additions.
 */

const SOURCE_URL = 'https://raw.githubusercontent.com/fiorelorenzo/pitchbox/main/web/src/app.css';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Every `--token: value` declaration inside the first block whose selector list
 * contains `selector`, in source order. Mirrors the product repository's own parser
 * (`shared/tests/token-drift.test.ts`) so the two stay easy to compare by eye.
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
let sourceCss: string;

beforeAll(async () => {
	const response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(15_000) });
	if (!response.ok) {
		throw new Error(`could not fetch ${SOURCE_URL}: HTTP ${response.status}`);
	}
	sourceCss = await response.text();
}, 20_000);

describe.each([
	['light', ':root'],
	['dark', '.dark']
])('%s token block', (_name, selector) => {
	it('matches pitchbox/web/src/app.css exactly, token for token', () => {
		const source = declarations(sourceCss, selector);
		const landing = declarations(landingCss, selector);

		// Guards the parser itself: a regex that silently matched nothing would make
		// the equality assertion below pass on two empty maps.
		expect(source.size).toBeGreaterThan(15);

		const sourceEntries = Object.fromEntries(source);
		const landingEntries = Object.fromEntries(landing);
		expect(landingEntries).toEqual(sourceEntries);
	});
});
