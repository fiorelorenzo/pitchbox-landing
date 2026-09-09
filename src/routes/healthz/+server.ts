/**
 * Liveness probe for the deploy health gate (#422: `scripts/deploy/release.sh` in the
 * deploy half of this issue compares this response's version and commit against what
 * it just built). This landing has no database and no external dependency to check -
 * answering at all is the whole signal - so unlike the product app's own `/healthz`
 * this one is unconditionally `ok`.
 *
 * `__APP_VERSION__` and `__APP_COMMIT__` are compiled in at build time (`vite.config.ts`'s
 * `define`), never read from `process.env` here: a runtime env var overriding what
 * this route reports would make the health gate's own comparison meaningless, since it
 * exists specifically to prove the served artifact is the built one.
 */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json(
		{
			status: 'ok',
			version: __APP_VERSION__,
			commit: __APP_COMMIT__
		},
		{ headers: { 'cache-control': 'no-store' } }
	);
};
