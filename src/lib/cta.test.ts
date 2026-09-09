import { describe, expect, it } from 'vitest';
import { primaryCta, REGISTER_URL, secondaryCta } from './cta';

describe('primaryCta', () => {
	it('renders the invite wording in both languages while signup stays closed', () => {
		expect(primaryCta('en', false)).toEqual({ label: 'Request an invite', href: REGISTER_URL });
		expect(primaryCta('it', false)).toEqual({ label: 'Richiedi un invito', href: REGISTER_URL });
	});

	it('renders the open-registration wording in both languages once signup flips', () => {
		expect(primaryCta('en', true)).toEqual({ label: 'Create an account', href: REGISTER_URL });
		expect(primaryCta('it', true)).toEqual({ label: 'Crea un account', href: REGISTER_URL });
	});

	it('always points at the app host register page regardless of wording', () => {
		expect(primaryCta('en', false).href).toBe(REGISTER_URL);
		expect(primaryCta('en', true).href).toBe(REGISTER_URL);
	});
});

describe('secondaryCta', () => {
	it('offers the self-host quickstart in the requested language', () => {
		expect(secondaryCta('en').label).toBe('Read the self-host quickstart');
		expect(secondaryCta('it').label).toBe('Leggi la guida rapida per il self-hosting');
	});
});
