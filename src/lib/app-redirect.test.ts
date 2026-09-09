import { describe, expect, it } from 'vitest';
import { appRedirectTarget, isAppPath } from './app-redirect';

describe('isAppPath', () => {
	it('matches every top-level app route', () => {
		for (const segment of [
			'analytics',
			'api',
			'audit',
			'blocklist',
			'campaigns',
			'contacts',
			'conversations',
			'inbox',
			'invite',
			'login',
			'notifications',
			'people',
			'playbooks',
			'projects',
			'register',
			'reset',
			'settings'
		]) {
			expect(isAppPath(`/${segment}`)).toBe(true);
		}
	});

	it('matches a nested path by its first segment', () => {
		expect(isAppPath('/inbox/42')).toBe(true);
		expect(isAppPath('/settings/quota')).toBe(true);
	});

	it('does not match a landing route', () => {
		expect(isAppPath('/')).toBe(false);
		expect(isAppPath('/it')).toBe(false);
		expect(isAppPath('/healthz')).toBe(false);
	});

	it('does not match /it/inbox: locale prefixing an app path is not a real page', () => {
		expect(isAppPath('/it/inbox')).toBe(false);
	});

	it('does not match a path that merely starts with an app segment as a substring', () => {
		expect(isAppPath('/inboxes')).toBe(false);
		expect(isAppPath('/logout')).toBe(false);
	});

	it('rejects an unknown path: still a 404, not a redirect', () => {
		expect(isAppPath('/some-unknown-page')).toBe(false);
	});
});

describe('appRedirectTarget', () => {
	it('preserves a nested path and a query string', () => {
		const url = new URL('https://pitchbox.app/settings/quota?tab=usage');
		expect(appRedirectTarget(url, 'https://app.pitchbox.app')).toBe(
			'https://app.pitchbox.app/settings/quota?tab=usage'
		);
	});

	it('is driven entirely by the appOrigin argument, not a hardcoded host', () => {
		const url = new URL('https://pitchbox.app/inbox');
		expect(appRedirectTarget(url, 'https://app.example.com')).toBe('https://app.example.com/inbox');
	});
});
