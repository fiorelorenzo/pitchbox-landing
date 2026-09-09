/**
 * Who the operator legally is, for the identification block a privacy policy and a
 * set of terms have to carry.
 *
 * This is read from the environment on purpose. The name is public already, but the
 * postal address and the VAT number are a sole trader's home address and tax number,
 * and a git history is forever: they are set at build time on the deploy
 * (`PUBLIC_LEGAL_ADDRESS`, `PUBLIC_LEGAL_VAT`) and never committed here. Unset means
 * the line is simply not rendered, so a fork or a local build shows the documents
 * without inventing an address.
 */
import { PUBLIC_LEGAL_ADDRESS, PUBLIC_LEGAL_NAME, PUBLIC_LEGAL_VAT } from '$env/static/public';

export interface LegalEntity {
	name: string;
	address: string | null;
	vat: string | null;
}

export const LEGAL_ENTITY: LegalEntity = {
	name: PUBLIC_LEGAL_NAME,
	address: PUBLIC_LEGAL_ADDRESS || null,
	vat: PUBLIC_LEGAL_VAT || null
};

/** The label each line gets, per locale, in the identification block. */
export const ENTITY_LABELS = {
	en: { operator: 'Operator', address: 'Registered address', vat: 'VAT number' },
	it: { operator: 'Titolare', address: 'Sede', vat: 'Partita IVA' }
};
