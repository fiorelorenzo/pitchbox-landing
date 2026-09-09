/**
 * `$env/dynamic/private` reads real process env when imported unmocked, so this file
 * replaces the module outright rather than stubbing individual variables - the same
 * approach canonry-landing's own `mail.test.ts` uses for the same reason: a stub can
 * leave a real value reachable through whichever key it does not override.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { APP_VERSION: 't1', APP_COMMIT: 'abc1234' } as Record<string, string | undefined>
}));

import { GET } from './+server';

describe('GET /healthz', () => {
	it('reports the version and commit read from the environment, not a hardcoded value', async () => {
		const response = await GET({} as never);
		const body = await response.json();

		expect(body).toEqual({ status: 'ok', version: 't1', commit: 'abc1234' });
	});

	it('is not cached', async () => {
		const response = await GET({} as never);

		expect(response.headers.get('cache-control')).toBe('no-store');
	});
});
