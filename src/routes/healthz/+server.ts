/**
 * Liveness probe for the deploy health gate (#422: `scripts/deploy/release.sh` in the
 * deploy half of this issue compares this response's version and commit against what
 * it just built). This landing has no database and no external dependency to check -
 * answering at all is the whole signal - so unlike the product app's own `/healthz`
 * this one is unconditionally `ok`.
 */
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json(
		{
			status: 'ok',
			version: env.APP_VERSION ?? null,
			commit: env.APP_COMMIT ?? null
		},
		{ headers: { 'cache-control': 'no-store' } }
	);
};
