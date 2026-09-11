/**
 * `$env/static/public` reads the real build-time value when imported unmocked (see
 * `vite.config.ts`'s own default), so this file replaces it outright - the same
 * approach `mail.test.ts` in canonry-landing uses for `$env/dynamic/private`, for the
 * same reason: a test has to control the value it is asserting against, not inherit
 * whatever the environment happens to hold.
 */
import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { LOCALE_COOKIE } from '$lib/i18n';

vi.mock('$env/static/public', () => ({
	PUBLIC_APP_ORIGIN: 'https://app.pitchbox.app',
	PUBLIC_SIGNUP_OPEN: 'false'
}));

import { handle } from './hooks.server';

/** `acceptLanguage` and `cookie` default to absent, matching a bare request that
 * carries neither - the shape every app-path-redirect test below already relies on.
 * A hand-built minimal object, not a real `Request`/`Cookies`, the same shortcut the
 * original `{ url } as RequestEvent` already took. */
function requestEvent(
	url: string,
	options: { acceptLanguage?: string; cookie?: string } = {}
): RequestEvent {
	return {
		url: new URL(url),
		request: {
			headers: {
				get: (name: string) =>
					name === 'accept-language' ? (options.acceptLanguage ?? null) : null
			}
		},
		cookies: {
			get: (name: string) => (name === LOCALE_COOKIE ? options.cookie : undefined)
		}
	} as unknown as RequestEvent;
}

const sentinelResponse = new Response('landing content');
const resolveWithSentinel = async () => sentinelResponse;

describe('handle: app-path redirect', () => {
	it('redirects a top-level app path with a 308 to the app origin', async () => {
		await expect(
			handle({ event: requestEvent('https://pitchbox.app/inbox'), resolve: resolveWithSentinel })
		).rejects.toMatchObject({ status: 308, location: 'https://app.pitchbox.app/inbox' });
	});

	it('preserves a nested path and a query string', async () => {
		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/settings/quota?tab=usage'),
				resolve: resolveWithSentinel
			})
		).rejects.toMatchObject({
			status: 308,
			location: 'https://app.pitchbox.app/settings/quota?tab=usage'
		});
	});

	it('does not redirect the landing home or its Italian path', async () => {
		await expect(
			handle({ event: requestEvent('https://pitchbox.app/'), resolve: resolveWithSentinel })
		).resolves.toBe(sentinelResponse);
		await expect(
			handle({ event: requestEvent('https://pitchbox.app/it'), resolve: resolveWithSentinel })
		).resolves.toBe(sentinelResponse);
	});

	it('leaves an unknown path to the normal resolve path, so it 404s rather than redirects', async () => {
		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/some-unknown-page'),
				resolve: resolveWithSentinel
			})
		).resolves.toBe(sentinelResponse);
	});
});

describe('handle: locale negotiation on bare entry paths', () => {
	it('redirects a bare Italian Accept-Language header to /it', async () => {
		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/', {
					acceptLanguage: 'it-IT,it;q=0.9,en;q=0.8'
				}),
				resolve: resolveWithSentinel
			})
		).rejects.toMatchObject({ status: 302, location: '/it' });
	});

	it('does not redirect a bare English Accept-Language header', async () => {
		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/', {
					acceptLanguage: 'en-US,en;q=0.9,it;q=0.8'
				}),
				resolve: resolveWithSentinel
			})
		).resolves.toBe(sentinelResponse);
	});

	it('never rewrites an explicit /it path, whatever the header prefers', async () => {
		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/it/pricing', { acceptLanguage: 'en;q=1.0' }),
				resolve: resolveWithSentinel
			})
		).resolves.toBe(sentinelResponse);
	});

	it('lets a locale cookie outrank a disagreeing Accept-Language header', async () => {
		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/', {
					acceptLanguage: 'it-IT,it;q=0.9',
					cookie: 'en'
				}),
				resolve: resolveWithSentinel
			})
		).resolves.toBe(sentinelResponse);

		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/pricing', {
					acceptLanguage: 'en-US,en;q=0.9',
					cookie: 'it'
				}),
				resolve: resolveWithSentinel
			})
		).rejects.toMatchObject({ status: 302, location: '/it/pricing' });
	});

	it('falls back to English on a malformed Accept-Language header', async () => {
		await expect(
			handle({
				event: requestEvent('https://pitchbox.app/', { acceptLanguage: ';;;garbage,,,' }),
				resolve: resolveWithSentinel
			})
		).resolves.toBe(sentinelResponse);
	});

	it('falls back to English with no Accept-Language header at all', async () => {
		await expect(
			handle({ event: requestEvent('https://pitchbox.app/'), resolve: resolveWithSentinel })
		).resolves.toBe(sentinelResponse);
	});
});
