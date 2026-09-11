/**
 * The landing's copy (#422's baseline, extended by #425 to the brief's full story:
 * the loop with real screenshots, the in-page companion, the boundary, the two ways
 * to run it, and the footer). One object per locale so a page component only ever
 * reads `CONTENT[locale]` and never assembles English and Italian strings by hand.
 * `loop.draftShotAlt`/`sentShotAlt` and `companion.shotAlt` describe the screenshots
 * `Home.svelte` renders from `static/screenshots/` - real captures, not mockups; see
 * `docs/screenshots.md` for how they were taken.
 */
import type { Locale } from './i18n';

export const SITE_URL = 'https://pitchbox.app';
export const GITHUB_URL = 'https://github.com/fiorelorenzo/pitchbox';
export const DOCS_URL = 'https://fiorelorenzo.github.io/pitchbox/';
export const APP_URL = 'https://app.pitchbox.app';

/** Every locale-neutral public route this site serves, in `Seo.svelte`'s own `path`
 * shape (`'/'`, `'/privacy'`). The sitemap (#426, `src/routes/sitemap.xml`) is
 * generated from this list rather than hand-typed XML - a new public page adds one
 * entry here and both locales' URLs follow automatically. `/privacy` and `/terms`
 * are listed even though their routes belong to #427: they exist on `main` already
 * and are public, so a sitemap that omitted them would be wrong on day one. */
export const PUBLIC_ROUTES: readonly string[] = ['/', '/privacy', '/terms', '/pricing'];

export interface LandingContent {
	title: string;
	description: string;
	hero: { heading: string; subhead: string; inviteNote: string };
	/** The objection section (LOR-225): four checkable mechanisms, not an adjective,
	 * answering "does this read as AI" right after the hero - `shared/src/assist
	 * /voice-profile.ts`'s MIN_ITEMS_TO_DERIVE floor, `shared/src/style-check.ts`'s
	 * mechanical + structural repair pass, and the never-auto-send boundary. `proofCta`
	 * ($lib/cta) is this section's own link into `docs/voice.md`, the page that backs
	 * every claim here with the file it lives in. */
	mechanism: {
		heading: string;
		items: [string, string, string, string];
		/** A real before/after pair (a generic draft, the same draft after the voice
		 * profile and style checker), once one exists to show honestly - Main's
		 * 27-case measurement (LOR-44) is the "before", the rest of this wave is the
		 * "after". Optional and unset in both locales today on purpose: a named slot
		 * this section can receive later without restructuring, never a placeholder
		 * or an invented sample standing in for the real thing. */
		beforeAfter?: { beforeLabel: string; before: string; afterLabel: string; after: string };
	};
	loop: {
		heading: string;
		steps: [string, string, string];
		draftShotAlt: string;
		draftShotCaption: string;
		sentShotAlt: string;
		sentShotCaption: string;
	};
	companion: {
		heading: string;
		body: string;
		boundary: string;
		shotAlt: string;
		shotCaption: string;
	};
	boundary: { heading: string; items: string[] };
	ways: {
		heading: string;
		selfHost: { heading: string; body: string };
		cloud: { heading: string; body: string };
	};
	footer: { app: string; docs: string; github: string; privacy: string; terms: string };
	nav: { skipToContent: string; wordmark: string; pricing: string; switchLanguage: string };
}

export const CONTENT: Record<Locale, LandingContent> = {
	en: {
		title: 'Pitchbox: it researches and drafts, you send',
		description:
			'A self-hosted outreach agent for Reddit, Hacker News, Mastodon and LinkedIn. It researches and drafts, you send, nothing leaves without you.',
		hero: {
			heading: 'It researches and drafts. You send. Nothing leaves without you.',
			subhead: 'A self-hosted outreach agent for Reddit, Hacker News, Mastodon and LinkedIn.',
			inviteNote:
				'Cloud sign-up is invite-only right now - the button opens an email asking for one. Self-hosting is open today, no invite needed.'
		},
		mechanism: {
			heading: 'The checks behind every draft',
			items: [
				"It reads what you've already written before it claims to know your voice. Under three pieces of writing, it says so and stops there, rather than inventing a style.",
				'A checker in the code strips tells like the em dash before a draft reaches you. No model is asked nicely to skip them - the code just does it.',
				'If a tell survives that pass anyway, the draft still shows it to you instead of hiding it.',
				'Nothing sends on its own. The worst a rough draft can do is sit in your inbox until you delete it.'
			]
		},
		loop: {
			heading: 'How it works',
			steps: [
				'It researches the thread and drafts a reply in your voice.',
				'You read it in the Inbox and approve, edit or reject it.',
				'You send it yourself, and Pitchbox records that you did.'
			],
			draftShotAlt:
				'The Pitchbox inbox showing three drafts waiting for review, one opened with its reasoning and an Approve button.',
			draftShotCaption: 'Drafts wait for you in the Inbox. Nothing sends until you approve.',
			sentShotAlt:
				'The Pitchbox inbox filtered to Sent, showing messages the operator sent themselves with a sent date.',
			sentShotCaption: 'Once you send it, Pitchbox records it. It never sends for you.'
		},
		companion: {
			heading: 'The in-page companion',
			body: 'A Chrome extension reads the LinkedIn post you already have open and drafts a comment in the same panel style as the Inbox.',
			boundary:
				"It reads the page you opened. It never clicks anything. You press LinkedIn's own button.",
			shotAlt:
				'The Pitchbox panel open on a LinkedIn post, showing a drafted comment with Insert, Drier, Warmer and Shorter controls.',
			shotCaption: 'The panel that reads the post you have open, and nothing else.'
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
			pricing: 'Pricing',
			switchLanguage: 'Italiano'
		}
	},
	it: {
		title: 'Pitchbox: ricerca e scrive le bozze, sei tu a inviare',
		description:
			'Un agente di outreach self-hosted per Reddit, Hacker News, Mastodon e LinkedIn. Ricerca e scrive le bozze, sei tu a inviare, niente esce senza il tuo consenso.',
		hero: {
			heading: 'Ricerca e scrive le bozze. Sei tu a inviare. Niente esce senza il tuo consenso.',
			subhead: 'Un agente di outreach self-hosted per Reddit, Hacker News, Mastodon e LinkedIn.',
			inviteNote:
				"L'iscrizione al cloud è per ora solo su invito - il pulsante apre un'email per richiederlo. Il self-hosting è aperto da subito, senza bisogno di invito."
		},
		mechanism: {
			heading: 'I controlli dietro ogni bozza',
			items: [
				'Legge quello che hai già scritto prima di dichiarare di conoscere il tuo tono. Sotto i tre testi, lo dice apertamente e si ferma lì, invece di inventarsi uno stile.',
				'Un controllo nel codice toglie i tic di scrittura, a partire dal trattino lungo, prima che la bozza arrivi a te. Non lo si chiede con garbo a un modello - lo fa il codice.',
				'Se un tic sopravvive comunque al controllo, la bozza te lo mostra invece di nasconderlo.',
				'Non invia mai nulla da sola. Il peggio che una bozza approssimativa può fare è restare nella tua inbox finché non la cancelli.'
			]
		},
		loop: {
			heading: 'Come funziona',
			steps: [
				'Analizza il thread e scrive una bozza di risposta nel tuo tono.',
				'La leggi nella Inbox e la approvi, la modifichi o la rifiuti.',
				"La invii tu, e Pitchbox registra che l'hai fatto."
			],
			draftShotAlt:
				'La inbox di Pitchbox con tre bozze in attesa di revisione, una aperta con il suo ragionamento e il pulsante Approva.',
			draftShotCaption: 'Le bozze aspettano nella Inbox. Niente parte finché non approvi.',
			sentShotAlt:
				"La inbox di Pitchbox filtrata su Inviati, con i messaggi che l'operatore ha inviato lui stesso e la data di invio.",
			sentShotCaption: 'Quando la invii, Pitchbox lo registra. Non invia mai al posto tuo.'
		},
		companion: {
			heading: 'Il pannello integrato',
			body: "Un'estensione per Chrome legge il post di LinkedIn che hai già aperto e scrive una bozza di commento nello stesso stile della Inbox.",
			boundary:
				'Legge la pagina che hai aperto. Non clicca mai nulla. Sei tu a premere il pulsante di LinkedIn.',
			shotAlt:
				'Il pannello di Pitchbox aperto su un post LinkedIn, con una bozza di commento e i controlli Inserisci, Più asciutto, Più caldo e Più breve.',
			shotCaption: "Il pannello che legge il post che hai aperto, e nient'altro."
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
			pricing: 'Prezzi',
			switchLanguage: 'English'
		}
	}
};
