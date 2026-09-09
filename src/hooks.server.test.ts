/**
 * `$env/static/public` reads the real build-time value when imported unmocked (see
 * `vite.config.ts`'s own default), so this file replaces it outright - the same
 * approach `mail.test.ts` in canonry-landing uses for `$env/dynamic/private`, for the
 * same reason: a test has to control the value it is asserting against, not inherit
 * whatever the environment happens to hold.
 */
import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

vi.mock('$env/static/public', () => ({
	PUBLIC_APP_ORIGIN: 'https://app.pitchbox.app',
	PUBLIC_SIGNUP_OPEN: 'false'
}));

import { handle } from './hooks.server';

function requestEvent(url: string): RequestEvent {
	return { url: new URL(url) } as RequestEvent;
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
