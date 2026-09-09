/**
 * The identification block is the one part of a legal page that must never be
 * invented. Its address and VAT number arrive from `PUBLIC_LEGAL_*` at build time
 * (secrets on the deploy, absent in this repository), so both the "set" and the
 * "unset" build have to be correct: a deploy that forgot the secret must publish the
 * documents without an address line, never with a placeholder one.
 *
 * `$env/static/public` is replaced outright for the same reason `hooks.server.test.ts`
 * replaces it: a test controls the value it asserts against.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/static/public', () => ({
	PUBLIC_LEGAL_NAME: 'Lorenzo Fiore',
	PUBLIC_LEGAL_ADDRESS: '',
	PUBLIC_LEGAL_VAT: ''
}));

import { ENTITY_LABELS, LEGAL_ENTITY } from './legal-entity';

describe('LEGAL_ENTITY', () => {
	it('reports an unset address and VAT number as absent, not as an empty string', () => {
		expect(LEGAL_ENTITY.address).toBeNull();
		expect(LEGAL_ENTITY.vat).toBeNull();
	});

	it('keeps the operator name, which is public and always rendered', () => {
		expect(LEGAL_ENTITY.name).toBe('Lorenzo Fiore');
	});

	it('labels the block in both languages the site serves', () => {
		expect(Object.keys(ENTITY_LABELS).sort()).toEqual(['en', 'it']);
		for (const labels of Object.values(ENTITY_LABELS)) {
			expect(labels.operator.length).toBeGreaterThan(0);
			expect(labels.address.length).toBeGreaterThan(0);
			expect(labels.vat.length).toBeGreaterThan(0);
		}
	});
});
