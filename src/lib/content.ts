/**
 * The landing's copy for this version (#422, implementing the brief and the hero
 * decision approved on #423, 2026-09-09). One object per locale so a page component
 * only ever reads `CONTENT[locale]` and never assembles English and Italian strings
 * by hand. Scope is exactly what the story in #423 settles: the hero, the boundary
 * section, the two ways to run it, and the footer - screenshots, pricing, testimonials
 * and the rest of the story stay out, deferred to #425.
 */
import type { Locale } from './i18n';

export const GITHUB_URL = 'https://github.com/fiorelorenzo/pitchbox';
export const DOCS_URL = 'https://fiorelorenzo.github.io/pitchbox/';
export const APP_URL = 'https://app.pitchbox.app';

export interface LandingContent {
	title: string;
	description: string;
	hero: { heading: string; subhead: string };
	boundary: { heading: string; items: string[] };
	ways: {
		heading: string;
		selfHost: { heading: string; body: string };
		cloud: { heading: string; body: string };
	};
	footer: { app: string; docs: string; github: string; privacy: string; terms: string };
	nav: { skipToContent: string; wordmark: string; switchLanguage: string };
}

export const CONTENT: Record<Locale, LandingContent> = {
	en: {
		title: 'Pitchbox: it researches and drafts, you send',
		description:
			'A self-hosted outreach agent for Reddit, Hacker News, Mastodon and LinkedIn. It researches and drafts, you send, nothing leaves without you.',
		hero: {
			heading: 'It researches and drafts. You send. Nothing leaves without you.',
			subhead: 'A self-hosted outreach agent for Reddit, Hacker News, Mastodon and LinkedIn.'
		},
		boundary: {
			heading: 'What it will not do',
			items: [
				'It never sends a message. Every draft waits in your inbox until you approve it.',
				'It never crawls LinkedIn. The in-page companion reads the post you already opened, nothing else.',
				'It respects a blocklist and a dedup window, so the same person is never contacted twice by mistake.',
				'It shows you the cost of every run before you approve what it drafted.'
			]
		},
		ways: {
			heading: 'Two ways to run it',
			selfHost: {
				heading: 'Self-host it',
				body: 'Run it on your own infrastructure, under the AGPL license, with your own API key.'
			},
			cloud: {
				heading: 'Or use the cloud edition',
				body: "The models are ours and every run carries a spending cap, so there's nothing to provision."
			}
		},
		footer: {
			app: 'Open the app',
			docs: 'Docs',
			github: 'GitHub',
			privacy: 'Privacy',
			terms: 'Terms'
		},
		nav: {
			skipToContent: 'Skip to content',
			wordmark: 'Pitchbox',
			switchLanguage: 'Italiano'
		}
	},
	it: {
		title: 'Pitchbox: ricerca e scrive le bozze, sei tu a inviare',
		description:
			'Un agente di outreach self-hosted per Reddit, Hacker News, Mastodon e LinkedIn. Ricerca e scrive le bozze, sei tu a inviare, niente esce senza il tuo consenso.',
		hero: {
			heading: 'Ricerca e scrive le bozze. Sei tu a inviare. Niente esce senza il tuo consenso.',
			subhead: 'Un agente di outreach self-hosted per Reddit, Hacker News, Mastodon e LinkedIn.'
		},
		boundary: {
			heading: 'Quello che non farà mai',
			items: [
				'Non invia mai un messaggio. Ogni bozza resta nella tua inbox finché non la approvi.',
				"Non esegue mai la scansione di LinkedIn. Il pannello integrato legge solo il post che hai già aperto, nient'altro.",
				'Rispetta una blocklist e una finestra di deduplicazione, così la stessa persona non viene mai contattata due volte per errore.',
				'Mostra il costo di ogni run prima che tu approvi ciò che ha scritto.'
			]
		},
		ways: {
			heading: 'Due modi per usarlo',
			selfHost: {
				heading: 'Installalo tu stesso',
				body: 'Eseguilo sulla tua infrastruttura, con licenza AGPL e la tua chiave API.'
			},
			cloud: {
				heading: "Oppure usa l'edizione cloud",
				body: 'I modelli sono nostri e ogni run ha un tetto di spesa, quindi non devi predisporre nulla.'
			}
		},
		footer: {
			app: "Apri l'app",
			docs: 'Documentazione',
			github: 'GitHub',
			privacy: 'Privacy',
			terms: 'Termini'
		},
		nav: {
			skipToContent: 'Vai al contenuto',
			wordmark: 'Pitchbox',
			switchLanguage: 'English'
		}
	}
};
