import { describe, expect, it } from 'vitest';
import { localeFromPathname } from './i18n';

describe('localeFromPathname', () => {
	it('treats the bare /it path as Italian', () => {
		expect(localeFromPathname('/it')).toBe('it');
	});

	it('treats anything nested under /it/ as Italian', () => {
		expect(localeFromPathname('/it/pricing')).toBe('it');
	});

	it('treats the root and everything else as English', () => {
		expect(localeFromPathname('/')).toBe('en');
		expect(localeFromPathname('/docs')).toBe('en');
	});

	it('does not match a path that merely starts with "it" as a word', () => {
		expect(localeFromPathname('/italy')).toBe('en');
		expect(localeFromPathname('/items')).toBe('en');
	});

	it('never negotiates on a header: the pathname is the only input', () => {
		// This resolver has no second parameter to take an Accept-Language value in the
		// first place - the type signature itself is the guarantee - so this test pins
		// the one input it does take: an /it path stays Italian, an English path stays
		// English, regardless of what a visitor's browser would have preferred.
		expect(localeFromPathname('/it')).toBe('it');
		expect(localeFromPathname('/')).toBe('en');
	});
});
