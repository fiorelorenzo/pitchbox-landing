import { describe, expect, it } from 'vitest';
import { planCta, primaryCta, proofCta, REGISTER_URL, secondaryCta, VOICE_DOCS_URL } from './cta';
import { SUPPORT_EMAIL } from './legal';

describe('primaryCta', () => {
	it('renders the invite wording and a mailto invite request while signup stays closed', () => {
		const en = primaryCta('en', false);
		expect(en.label).toBe('Request an invite');
		expect(en.href.startsWith(`mailto:${SUPPORT_EMAIL}?`)).toBe(true);
		expect(decodeURIComponent(en.href)).toContain('subject=Cloud invite request');

		const it_ = primaryCta('it', false);
		expect(it_.label).toBe('Richiedi un invito');
		expect(it_.href.startsWith(`mailto:${SUPPORT_EMAIL}?`)).toBe(true);
	});

	it('renders the open-registration wording and the real register link once signup flips', () => {
		expect(primaryCta('en', true)).toEqual({ label: 'Create an account', href: REGISTER_URL });
		expect(primaryCta('it', true)).toEqual({ label: 'Crea un account', href: REGISTER_URL });
	});

	it('never sends a visitor to the register page while signup is closed', () => {
		expect(primaryCta('en', false).href).not.toBe(REGISTER_URL);
		expect(primaryCta('it', false).href).not.toBe(REGISTER_URL);
	});
});

describe('planCta', () => {
	it('folds the plan name into the mailto invite request while signup stays closed', () => {
		const cta = planCta('en', false, 'growth', 'Growth', 'month');
		expect(cta.label).toBe('Request an invite for Growth');
		expect(cta.href.startsWith(`mailto:${SUPPORT_EMAIL}?`)).toBe(true);
		expect(decodeURIComponent(cta.href)).toContain('Growth');
		expect(cta.href).not.toContain('plan=');
	});

	it('carries plan and interval into the register link once signup is open', () => {
		const cta = planCta('en', true, 'growth', 'Growth', 'year');
		expect(cta).toEqual({
			label: 'Start with Growth',
			href: `${REGISTER_URL}?plan=growth&interval=year`
		});
	});
});

describe('secondaryCta', () => {
	it('offers the self-host quickstart in the requested language', () => {
		expect(secondaryCta('en').label).toBe('Read the self-host quickstart');
		expect(secondaryCta('it').label).toBe('Leggi la guida rapida per il self-hosting');
	});
});

describe('proofCta', () => {
	it('always points at the voice-profile docs page, regardless of locale', () => {
		expect(proofCta('en')).toEqual({
			label: 'Read how the voice profile and checker work',
			href: VOICE_DOCS_URL
		});
		expect(proofCta('it')).toEqual({
			label: 'Leggi come funzionano il profilo del tono e il controllo di stile',
			href: VOICE_DOCS_URL
		});
	});
});
