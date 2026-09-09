/**
 * The pricing page's own copy (#558): headings, the per-plan feature-row labels,
 * and the three paragraphs the issue asked for explicitly - what is metered and
 * what happens at a limit, what Managed Payments means for the buyer, and that
 * self-hosting is free and unlimited. None of it carries a number: every number
 * on the page comes from `$lib/plan-snapshot.json` through `$lib/plans.ts`'s
 * formatters, never from a literal typed here.
 */
import type { Locale } from './i18n';

export interface PricingContent {
	title: string;
	description: string;
	heading: string;
	subhead: string;
	inviteNote: string;
	billingToggle: { monthly: string; annual: string; annualBadge: (percent: number) => string };
	priceSuffix: { monthly: string; annual: string };
	freePriceLabel: string;
	featureLabels: {
		projects: string;
		runsPerMonth: string;
		suggestionsPerMonth: string;
		seats: string;
		accounts: string;
		extensionDevices: string;
		maxConcurrentRuns: string;
		monthlyRunBudgetUsd: (amount: string) => string;
		retentionDays: (days: string) => string;
		premiumModels: string;
		webhooks: string;
	};
	metering: { heading: string; body: string[] };
	managedPayments: { heading: string; body: string[] };
	selfHost: { heading: string; body: string; cta: string };
	taxNote: string;
}

export const PRICING_CONTENT: Record<Locale, PricingContent> = {
	en: {
		title: 'Pricing - Pitchbox',
		description:
			'Pitchbox plans and prices, read straight from the product catalogue: Free, Solo, Growth and Scale, monthly or annual.',
		heading: 'Plans and pricing',
		subhead:
			'Self-host for free with no limits, or run the hosted edition on one of four plans. Every number below is the one the app itself enforces.',
		inviteNote:
			'Cloud sign-up is invite-only right now - every paid button opens an email asking for one.',
		billingToggle: {
			monthly: 'Monthly',
			annual: 'Annual',
			annualBadge: (percent) => `Save ${percent}%`
		},
		priceSuffix: { monthly: '/month', annual: '/year' },
		freePriceLabel: 'Free',
		featureLabels: {
			projects: 'Projects',
			runsPerMonth: 'Runs per month',
			suggestionsPerMonth: 'LinkedIn suggestions per month',
			seats: 'Seats',
			accounts: 'Connected accounts',
			extensionDevices: 'Chrome extension devices',
			maxConcurrentRuns: 'Concurrent runs',
			monthlyRunBudgetUsd: (amount) => `AI usage budget: ${amount} per month`,
			retentionDays: (days) => `Data kept for ${days} days`,
			premiumModels: 'Premium models',
			webhooks: 'Webhooks'
		},
		metering: {
			heading: 'What is metered, and what happens at the limit',
			body: [
				'A run is one scheduled or manual pass of a campaign; a suggestion is one draft the in-page LinkedIn companion writes. Both reset at the start of your billing period, never mid-month.',
				'Hitting a limit is a hard stop with an upgrade prompt, not a silent quality drop or a surprise overage charge: nothing queues, nothing degrades to a cheaper model behind your back, and nothing bills you for going over. You either upgrade or wait for the next period.'
			]
		},
		managedPayments: {
			heading: 'How billing works',
			body: [
				'Paid plans sell through Stripe Checkout under Managed Payments, so Stripe is the seller of record for your subscription, not Pitchbox - your card statement reads "LINK.COM* PITCHBOX".',
				'Prices above are tax-exclusive; Stripe calculates and adds your local sales tax, VAT or GST at checkout. You can cancel, switch plans or download an invoice any time from the customer portal.'
			]
		},
		selfHost: {
			heading: 'Self-hosting stays free, with no limits',
			body: 'Run Pitchbox on your own infrastructure under the AGPL license, with your own AI Gateway key. No plan, no metering, no account required.',
			cta: 'Read the self-host quickstart'
		},
		taxNote: 'USD pays the same headline number as EUR ($29 / $79 / $199), not a converted amount.'
	},
	it: {
		title: 'Prezzi - Pitchbox',
		description:
			'Piani e prezzi di Pitchbox, presi direttamente dal catalogo del prodotto: Free, Solo, Growth e Scale, mensile o annuale.',
		heading: 'Piani e prezzi',
		subhead:
			"Installalo tu stesso gratis e senza limiti, oppure usa l'edizione hosted con uno dei quattro piani. Ogni numero qui sotto è lo stesso che l'app applica davvero.",
		inviteNote:
			"L'iscrizione al cloud è per ora solo su invito - ogni pulsante a pagamento apre un'email per richiederlo.",
		billingToggle: {
			monthly: 'Mensile',
			annual: 'Annuale',
			annualBadge: (percent) => `Risparmi il ${percent}%`
		},
		priceSuffix: { monthly: '/mese', annual: '/anno' },
		freePriceLabel: 'Gratis',
		featureLabels: {
			projects: 'Progetti',
			runsPerMonth: 'Run al mese',
			suggestionsPerMonth: 'Suggerimenti LinkedIn al mese',
			seats: 'Utenti',
			accounts: 'Account collegati',
			extensionDevices: "Dispositivi con l'estensione Chrome",
			maxConcurrentRuns: 'Run in parallelo',
			monthlyRunBudgetUsd: (amount) => `Budget AI: ${amount} al mese`,
			retentionDays: (days) => `Dati conservati per ${days} giorni`,
			premiumModels: 'Modelli premium',
			webhooks: 'Webhook'
		},
		metering: {
			heading: 'Cosa viene misurato, e cosa succede al limite',
			body: [
				"Un run è un'esecuzione, pianificata o manuale, di una campagna; un suggerimento è una bozza scritta dal pannello integrato per LinkedIn. Entrambi si azzerano all'inizio del periodo di fatturazione, mai a metà mese.",
				'Raggiungere un limite è uno stop netto con un invito a fare upgrade, non un peggioramento silenzioso o un addebito a sorpresa: niente code, niente passaggio nascosto a un modello più economico, niente addebiti per lo sforamento. O fai upgrade, o aspetti il periodo successivo.'
			]
		},
		managedPayments: {
			heading: 'Come funziona la fatturazione',
			body: [
				'I piani a pagamento passano da Stripe Checkout con Managed Payments, quindi il venditore ufficiale del tuo abbonamento è Stripe, non Pitchbox: l\'estratto conto della carta riporta "LINK.COM* PITCHBOX".',
				'I prezzi sopra sono al netto delle tasse; Stripe calcola e aggiunge IVA o imposta locale al checkout. Puoi disdire, cambiare piano o scaricare una fattura in qualsiasi momento dal portale clienti.'
			]
		},
		selfHost: {
			heading: 'Il self-hosting resta gratis, senza limiti',
			body: 'Esegui Pitchbox sulla tua infrastruttura con licenza AGPL e la tua chiave AI Gateway. Nessun piano, nessuna misurazione, nessun account richiesto.',
			cta: 'Leggi la guida rapida per il self-hosting'
		},
		taxNote:
			'In USD il prezzo è lo stesso numero di quello in EUR ($29 / $79 / $199), non una conversione.'
	}
};
