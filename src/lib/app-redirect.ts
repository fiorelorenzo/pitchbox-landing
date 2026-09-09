/**
 * pitchbox.app's own routes moved off the apex once the app moved to
 * `app.pitchbox.app` (#424) and this landing took over `/`. Every bookmark, deep link
 * and extension pairing made before that flip still points at
 * `https://pitchbox.app/<app-path>`, so a request whose first path segment belongs to
 * the app gets handed back with a permanent redirect instead of a landing 404.
 *
 * The segment list is every top-level route directory under
 * `~/projects/personal/pitchbox/web/src/routes` (checked 2026-09-09, `find
 * web/src/routes -maxdepth 1 -type d`): analytics, api, audit, blocklist, campaigns,
 * contacts, conversations, inbox, invite, login, notifications, people, playbooks,
 * projects, register, reset, settings. `/logout` is deliberately not in this list: it
 * has no page route of its own, only `POST /api/auth/logout`, which the `/api` entry
 * already covers.
 */
const APP_PATH_SEGMENT_MAP: Record<string, true> = {
	analytics: true,
	api: true,
	audit: true,
	blocklist: true,
	campaigns: true,
	contacts: true,
	conversations: true,
	inbox: true,
	invite: true,
	login: true,
	notifications: true,
	people: true,
	playbooks: true,
	projects: true,
	register: true,
	reset: true,
	settings: true
};

export const APP_PATH_SEGMENTS: readonly string[] = Object.keys(APP_PATH_SEGMENT_MAP);

/** Whether a request's path belongs to the app rather than to the landing itself -
 * matched on the first path segment only, so `/inbox/42` and `/settings/quota` match
 * but `/inboxes` and `/it/inbox` (which is not a real page) do not. */
export function isAppPath(pathname: string): boolean {
	return APP_PATH_SEGMENT_MAP[pathname.split('/')[1] ?? ''] === true;
}

/** Where an app-bound request gets sent: the same path and query string, on
 * `appOrigin` - never a different path, never a stripped query. */
export function appRedirectTarget(url: URL, appOrigin: string): string {
	return `${appOrigin}${url.pathname}${url.search}`;
}
