/**
 * `__APP_VERSION__` and `__APP_COMMIT__` are compiled in once, at Vite config
 * resolution (`vite.config.ts`'s `define`), so unlike the old `$env/dynamic/private`
 * read there is nothing to mock here: the values these tests compare against are the
 * same literals the route itself was built with.
 */
import { describe, expect, it } from 'vitest';
import { GET } from './+server';

describe('GET /healthz', () => {
	it('reports the version and commit baked in at build time', async () => {
		const response = await GET({} as never);
		const body = await response.json();

		expect(body).toEqual({ status: 'ok', version: __APP_VERSION__, commit: __APP_COMMIT__ });
	});

	it('ignores a runtime environment override - the values are compiled in, not read from process.env', async () => {
		const before = await (await GET({} as never)).json();
		const originalVersion = process.env.APP_VERSION;
		const originalCommit = process.env.APP_COMMIT;

		process.env.APP_VERSION = 'SHOULD_NOT_APPEAR';
		process.env.APP_COMMIT = 'SHOULD_NOT_APPEAR';
		try {
			const after = await (await GET({} as never)).json();
			expect(after).toEqual(before);
			expect(after.version).not.toBe('SHOULD_NOT_APPEAR');
			expect(after.commit).not.toBe('SHOULD_NOT_APPEAR');
		} finally {
			process.env.APP_VERSION = originalVersion;
			process.env.APP_COMMIT = originalCommit;
		}
	});

	it('is not cached', async () => {
		const response = await GET({} as never);

		expect(response.headers.get('cache-control')).toBe('no-store');
	});
});
