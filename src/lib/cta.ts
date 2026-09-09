/**
 * The landing's one call to action (#423, decided 2026-09-09): an account on the app
 * host is primary, self-hosting is the equal-weight secondary. The primary button's
 * copy has to stay true while the instance's `registration_policy` is still `invite`
 * (see `docs/self-hosting.md` and `docs/auth.md` in the product repository) - it
 * cannot promise open sign-up before the switch actually flips. `PUBLIC_SIGNUP_OPEN`
 * is that switch's build-time mirror on this site: false (the default) renders the
 * invite wording, true renders the plain "create an account" wording. One flag, both
 * languages, nothing else decides which copy ships.
 */
import type { Locale } from './i18n';

export interface CtaLink {
	label: string;
	href: string;
}

/** Where every primary button points, regardless of wording: registration lives on
 * the app host, not on this one (#422 moved the app off the apex). */
export const REGISTER_URL = 'https://app.pitchbox.app/register';

/** The self-host path's destination: the docs quickstart, not this repository. */
export const QUICKSTART_URL = 'https://fiorelorenzo.github.io/pitchbox/getting-started';

const PRIMARY_LABEL: Record<Locale, { invite: string; open: string }> = {
	en: { invite: 'Request an invite', open: 'Create an account' },
	it: { invite: 'Richiedi un invito', open: 'Crea un account' }
};

const SECONDARY_LABEL: Record<Locale, string> = {
	en: 'Read the self-host quickstart',
	it: 'Leggi la guida rapida per il self-hosting'
};

/** The primary CTA: registration copy switches on `signupOpen`, the destination
 * never does. */
export function primaryCta(locale: Locale, signupOpen: boolean): CtaLink {
	const label = signupOpen ? PRIMARY_LABEL[locale].open : PRIMARY_LABEL[locale].invite;
	return { label, href: REGISTER_URL };
}

/** The secondary CTA: self-host, pointing at the docs quickstart, equal weight to the
 * primary and unaffected by the signup flag. */
export function secondaryCta(locale: Locale): CtaLink {
	return { label: SECONDARY_LABEL[locale], href: QUICKSTART_URL };
}
