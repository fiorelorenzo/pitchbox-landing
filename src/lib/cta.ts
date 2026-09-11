/**
 * The landing's one call to action (#423, decided 2026-09-09): an account on the app
 * host is primary once registration is open, self-hosting is the equal-weight
 * secondary path always. `PUBLIC_SIGNUP_OPEN` is the instance's `registration_policy`
 * switch's build-time mirror on this site (`docs/self-hosting.md` and `docs/auth.md`
 * in the product repository): false (the default) is where every self-host and cloud
 * deployment starts, true is a deliberate `pitchbox` instance-admin decision made
 * later, not something this build flips on its own.
 *
 * #428 is what decides the closed-signup destination. `REGISTER_URL` on its own is
 * not honest there: `app.pitchbox.app/register` renders a real "this deployment is
 * invite-only" card while closed, but that card's only exit is "Sign in instead" -
 * useless to a visitor who has no account yet, so a "Request an invite" button
 * landing there is a dead end with extra steps. The issue's own comments rule out
 * building a waitlist (no backend exists on this host and a waitlist database is not
 * wanted this version), which leaves the other honest option: a `mailto:` link that
 * actually reaches me, prefilled so the request is a name and a plan, not a blank
 * page. `inviteNote` in `$lib/content.ts` says the same thing in prose next to the
 * button, so the mailto and the copy make the same promise rather than one covering
 * for the other.
 */
import { SUPPORT_EMAIL } from './legal';
import type { Locale } from './i18n';
import type { PlanId } from './plans';

export interface CtaLink {
	label: string;
	href: string;
}

/** Where the primary button points once signup is open: registration lives on the
 * app host, not on this one (#422 moved the app off the apex). */
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

const INVITE_SUBJECT: Record<Locale, (planName?: string) => string> = {
	en: (planName) => (planName ? `Cloud invite request: ${planName}` : 'Cloud invite request'),
	it: (planName) =>
		planName ? `Richiesta di invito: ${planName}` : 'Richiesta di invito per il cloud'
};

const INVITE_BODY: Record<Locale, (planName?: string) => string> = {
	en: (planName) =>
		planName
			? `Hi, I'd like an invite to the Pitchbox cloud edition, on the ${planName} plan.`
			: "Hi, I'd like an invite to the Pitchbox cloud edition.",
	it: (planName) =>
		planName
			? `Ciao, vorrei un invito per l'edizione cloud di Pitchbox, per il piano ${planName}.`
			: "Ciao, vorrei un invito per l'edizione cloud di Pitchbox."
};

/** A prefilled `mailto:` to the same address `/privacy` and `/terms` already publish
 * as the support contact - not a new address, not a form, not a database, just the
 * one honest way a visitor without an account can actually ask. */
function inviteRequestHref(locale: Locale, planName?: string): string {
	const subject = encodeURIComponent(INVITE_SUBJECT[locale](planName));
	const body = encodeURIComponent(INVITE_BODY[locale](planName));
	return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

/** The primary CTA. Closed: the label promises a request and the link is one - a
 * prefilled email to me, not a page with no way to act. Open: the label promises an
 * account and the link is the real registration page. */
export function primaryCta(locale: Locale, signupOpen: boolean): CtaLink {
	if (!signupOpen) return { label: PRIMARY_LABEL[locale].invite, href: inviteRequestHref(locale) };
	return { label: PRIMARY_LABEL[locale].open, href: REGISTER_URL };
}

/** The secondary CTA: self-host, pointing at the docs quickstart, equal weight to the
 * primary and unaffected by the signup flag. */
export function secondaryCta(locale: Locale): CtaLink {
	return { label: SECONDARY_LABEL[locale], href: QUICKSTART_URL };
}

/** The docs page that backs the objection section's claims (LOR-225,
 * `docs/voice.md` in the product repository): every mechanism the landing states
 * there is spelled out here with the file it lives in. `cleanUrls: true` in that
 * repo's `docs/.vitepress/config.ts` is what makes the path `/voice` rather than
 * `/voice.html`. Unaffected by `signupOpen` - the page exists whether or not the
 * cloud edition is open. */
export const VOICE_DOCS_URL = 'https://docs.pitchbox.app/voice';

const PROOF_LABEL: Record<Locale, string> = {
	en: 'Read how the voice profile and checker work',
	it: 'Leggi come funzionano il profilo del tono e il controllo di stile'
};

/** The objection section's own CTA: not a signup step, just the receipt for what it
 * just claimed. */
export function proofCta(locale: Locale): CtaLink {
	return { label: PROOF_LABEL[locale], href: VOICE_DOCS_URL };
}

const PLAN_LABEL: Record<
	Locale,
	{ invite: (name: string) => string; open: (name: string) => string }
> = {
	en: { invite: (name) => `Request an invite for ${name}`, open: (name) => `Start with ${name}` },
	it: { invite: (name) => `Richiedi un invito per ${name}`, open: (name) => `Inizia con ${name}` }
};

/** One CTA per pricing-page column (#558): while signup is closed this behaves like
 * `primaryCta` with the plan name folded into the request, since there is no
 * Checkout to preselect until an account exists. Once open, the label names the plan
 * and the URL carries `plan`/`interval` so `/register` can preselect Checkout for it
 * (`app.pitchbox.app`'s own `/register?plan=growth` handling). Free has no plan to
 * preselect either way - callers use `primaryCta` for that column instead. */
export function planCta(
	locale: Locale,
	signupOpen: boolean,
	planId: Exclude<PlanId, 'free'>,
	planName: string,
	interval: 'month' | 'year'
): CtaLink {
	if (!signupOpen) {
		return {
			label: PLAN_LABEL[locale].invite(planName),
			href: inviteRequestHref(locale, planName)
		};
	}
	return {
		label: PLAN_LABEL[locale].open(planName),
		href: `${REGISTER_URL}?plan=${planId}&interval=${interval}`
	};
}
