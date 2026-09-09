#!/usr/bin/env node
/**
 * Requests every cross-origin URL this site's CTAs and footer links point at (the app
 * host's register page, the docs quickstart and index, the GitHub repo) and fails on
 * anything that does not answer 2xx.
 *
 * Issue #428: the landing crosses a host boundary the moment a visitor acts on it, and
 * nothing in `pnpm test` can prove `app.pitchbox.app/register` or the docs site are
 * actually up - they are pages this repository does not build. Adapted from
 * canonry-landing's scripts/check-external-links.mjs (~/projects/personal/canonry-landing,
 * the reference implementation named in #422): "a dead call to action on a marketing
 * page is the one bug nobody reports", so this makes it a red build instead.
 *
 * Every literal cross-origin URL a CTA or footer link can render lives in one of these
 * two modules ($lib/content.ts for the footer/nav links, $lib/cta.ts for the primary,
 * secondary and per-plan buttons) - so that is where URLs are read from, not a scan of
 * all of `src`, which would also catch a URL sitting inside a comment or a test
 * expectation and start failing for the wrong reason.
 *
 * This site's own domain (SITE_URL, `pitchbox.app` with no subdomain) is deliberately
 * excluded: checking the URL this exact build is about to become tells a PR nothing
 * about the PR, and would fail on an unrelated outage of whatever is live today.
 * `app.pitchbox.app` is a different host (the product) and stays checked.
 * `mailto:` links (the invite-request CTAs while signup is closed, #428) are skipped
 * too - there is no HTTP response to fetch for those, and their address is exercised by
 * `cta.test.ts` instead.
 *
 * Deliberately not part of `pnpm test`: that suite touches no network, so a plane, a
 * train or a slow docs host never blocks a unit run. CI runs this as its own step,
 * where a failure reads as "the thing we point at is down" rather than as a broken test.
 *
 * Usage: node scripts/check-external-links.mjs
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.join(import.meta.dirname, '..', 'src');
const URL_SOURCES = [path.join(SRC, 'lib', 'content.ts'), path.join(SRC, 'lib', 'cta.ts')];
const SELF_HOST = 'pitchbox.app';
const URL_PATTERN = /https:\/\/[^\s"'`<>)]+/g;
const ATTEMPTS = 3;
const TIMEOUT_MS = 15_000;

function isSelfHost(url) {
	// `app.pitchbox.app` is a distinct host from bare `pitchbox.app` (this site) and
	// must stay checked - only an exact hostname match is excluded.
	return new URL(url).hostname === SELF_HOST;
}

/** Every distinct URL, each with the files that link it, so a failure names where to
 * look. Trailing punctuation a sentence left attached to the URL (a period, a comma) is
 * trimmed before it becomes part of the request. */
async function collect() {
	const byUrl = new Map();
	for (const file of URL_SOURCES) {
		const text = await readFile(file, 'utf8');
		for (const match of text.matchAll(URL_PATTERN)) {
			const url = match[0].replace(/[.,;)]+$/, '');
			if (isSelfHost(url)) continue;
			const where = byUrl.get(url) ?? [];
			where.push(path.relative(SRC, file));
			byUrl.set(url, where);
		}
	}
	return byUrl;
}

/** GET rather than HEAD: adapter-node answers HEAD, but a CDN or a proxy in front of
 * one of these origins does not have to, and a 405 here would be a false failure. */
async function status(url) {
	let last = 'no attempt';
	for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
		try {
			const res = await fetch(url, {
				redirect: 'follow',
				signal: AbortSignal.timeout(TIMEOUT_MS),
				headers: { 'user-agent': 'pitchbox-landing-link-check' }
			});
			if (res.ok) return { ok: true, detail: String(res.status) };
			last = String(res.status);
		} catch (err) {
			last = err instanceof Error ? err.message : String(err);
		}
		if (attempt < ATTEMPTS) await new Promise((r) => setTimeout(r, 2000 * attempt));
	}
	return { ok: false, detail: last };
}

const byUrl = await collect();
if (byUrl.size === 0) {
	console.error(
		'found no cross-origin URLs in $lib/content.ts or $lib/cta.ts, which means this check is not checking anything'
	);
	process.exit(1);
}

const failed = [];
for (const [url, where] of [...byUrl].sort()) {
	const result = await status(url);
	console.log(`${result.ok ? 'ok  ' : 'FAIL'} ${result.detail.padEnd(6)} ${url}`);
	if (!result.ok) failed.push({ url, where, detail: result.detail });
}

if (failed.length > 0) {
	console.error('');
	for (const f of failed) {
		console.error(`${f.url} answered ${f.detail}, linked from: ${f.where.join(', ')}`);
	}
	console.error('');
	console.error('A link off this site is broken. Fix the target or take the link out;');
	console.error('shipping it is worse than not having it (#428).');
	process.exit(1);
}
