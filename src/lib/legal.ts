/**
 * The privacy policy and the terms of service, one object per locale, rendered by
 * `$lib/components/LegalDoc.svelte` at `/privacy`, `/terms` and their `/it` twins.
 *
 * Two rules this file follows and future edits must keep. First, every factual claim
 * here is a claim about the hosted app: what it stores, which processors it uses, how
 * long it keeps a row. It was written from the product repository (schema, retention
 * policy, platform clients, mail transport, the extension's content scripts), so a
 * change there can make a sentence here false, and the sentence has to move with it.
 * Second, the operator's postal address and VAT number are NOT in this repository:
 * they arrive from `PUBLIC_LEGAL_*` at build time (see `$lib/legal-entity.ts`), so a
 * public git history never carries a home address.
 */
import type { Locale } from './i18n';

export interface LegalSection {
	heading: string;
	/** Paragraphs and, where a list reads better, bullet items. */
	body: string[];
	bullets?: string[];
}

export interface LegalDocContent {
	title: string;
	description: string;
	heading: string;
	updated: string;
	sections: LegalSection[];
}

export interface LegalContent {
	privacy: LegalDocContent;
	terms: LegalDocContent;
	backToHome: string;
	updatedLabel: string;
}

/** The date both documents were last changed in substance. Bump it when the text
 * changes, not when a typo is fixed. */
export const LEGAL_UPDATED = { en: '9 September 2026', it: '9 settembre 2026' };

export const SUPPORT_EMAIL = 'support@pitchbox.app';
export const PRIVACY_EMAIL = 'privacy@pitchbox.app';

export const LEGAL: Record<Locale, LegalContent> = {
	en: {
		backToHome: 'Back to the home page',
		updatedLabel: 'Last updated',
		privacy: {
			title: 'Privacy policy - Pitchbox',
			description:
				'What the hosted Pitchbox app stores, who processes it, how long it is kept, and how to have it deleted.',
			heading: 'Privacy policy',
			updated: LEGAL_UPDATED.en,
			sections: [
				{
					heading: 'Who this is about',
					body: [
						`This policy covers the hosted app at app.pitchbox.app and this website. If you run Pitchbox yourself, under the AGPL licence, none of it applies to you: your installation stores its data on your own infrastructure and you are its controller, not us.`,
						`For anything in this policy, including a request to see or delete your data, write to ${PRIVACY_EMAIL}. For everything else there is ${SUPPORT_EMAIL}.`
					]
				},
				{
					heading: 'What the app stores',
					body: [
						`Only what the product needs to do its job. There is no profiling, no advertising, and nothing is sold or shared for anyone else's marketing.`
					],
					bullets: [
						`Your account: username, email address, a hashed password (never the password itself), and whether the address has been verified.`,
						`Your organization: its name, the spending cap and the concurrency limit that apply to your runs.`,
						`The platform accounts you connect: the handle and display name, plus the credential needed to act as that account. A Mastodon token is encrypted at rest with AES-256-GCM; a Reddit browser session is stored the same way.`,
						`Drafts and their history: the text the agent wrote, the source post it responded to, your edits, and whether you approved, rejected or sent it.`,
						`Contact history: which handle was contacted from which account and when, which is what stops the same person being contacted twice by mistake.`,
						`Posts the in-page companion observed on LinkedIn, when you enable it: the post URL and identifier, the author's handle and name, and the post text. Only from pages you opened yourself.`,
						`Run records: what the agent did, how long it took, and what it cost.`,
						`Security records: your sessions, and failed sign-in attempts stored against a username or an IP bucket so that brute force can be rate-limited.`
					]
				},
				{
					heading: 'What it does not do',
					body: [
						`This website sets no cookies, loads no third-party scripts and runs no analytics. Fonts are served from this domain, not from a font network.`,
						`The app has no analytics service, no session recording and no error-reporting service: there is no third-party SDK in it. Server logs stay on the server that produced them.`,
						`Nothing is ever sent on your behalf. Every message waits for you to approve it and, on Reddit and Hacker News, for you to send it yourself.`
					]
				},
				{
					heading: 'Who else processes it',
					body: [`The hosted app relies on these providers, and on no others:`],
					bullets: [
						`Netcup (Germany): the server and the database that run the app.`,
						`Stripe, including Link: payments. Stripe is the merchant of record for a subscription, issues the invoice and receipt, and calculates and remits the tax. Card details are entered on Stripe's own page and never reach us.`,
						`Vercel AI Gateway, and through it the model provider that answers a given run: the prompt for a draft, which includes the source post and the campaign brief, is sent there to be generated.`,
						`Resend: transactional email such as a password reset or an address verification.`,
						`Cloudflare: DNS for the domain, and the routing behind the support address.`
					]
				},
				{
					heading: 'The platforms you connect',
					body: [
						`When you connect Reddit, Hacker News or Mastodon, the app reads the public content you have pointed it at, using that platform's own API or public pages, and writes only what you approve.`,
						`LinkedIn is different by design. There is no server-side access to LinkedIn at all. The browser companion reads the page you already have open, sends what it read to your own Pitchbox account, and never fetches from LinkedIn, never clicks or submits anything for you, and never reads LinkedIn cookies.`
					]
				},
				{
					heading: 'How long it is kept',
					body: [`Old rows are pruned automatically, every hour:`],
					bullets: [
						`Observed LinkedIn posts: 3 days.`,
						`Run events: 30 days. Webhook deliveries: 30 days.`,
						`Draft events, and drafts that have been sent, rejected or replied to: 90 days.`,
						`Contact history is kept for as long as the project exists, because it is what the deduplication and the blocklist are built on. Deleting a project deletes it.`,
						`Your account, organization, projects, campaigns and connected accounts are kept until you delete them or ask us to.`
					]
				},
				{
					heading: 'Your rights',
					body: [
						`You can ask for a copy of your data, its correction, its export, or its deletion, and you can object to a particular processing. Write to ${PRIVACY_EMAIL} and you will get an answer within 30 days.`,
						`Deleting your account deletes your organizations, projects, drafts and connected accounts. Where a copy has already left our systems, for example an invoice held by Stripe because tax law requires it, that copy follows their own retention rules and we will tell you so.`,
						`The app's data lives in Germany. Stripe and the model providers may process data outside the European Union under their own transfer safeguards.`
					]
				},
				{
					heading: 'Changes',
					body: [
						`If this policy changes in substance, the date above changes and account holders are told by email before it takes effect.`
					]
				}
			]
		},
		terms: {
			title: 'Terms of service - Pitchbox',
			description:
				'The terms for using the hosted Pitchbox app: what the service does, what you may not use it for, how billing and cancellation work.',
			heading: 'Terms of service',
			updated: LEGAL_UPDATED.en,
			sections: [
				{
					heading: 'What you are agreeing to',
					body: [
						`These terms govern the hosted app at app.pitchbox.app. Running Pitchbox yourself is governed by its licence, the AGPL-3.0, and not by this document.`,
						`Questions, and anything that needs a human: ${SUPPORT_EMAIL}.`
					]
				},
				{
					heading: 'What the service does',
					body: [
						`Pitchbox researches public conversations on Reddit, Hacker News, Mastodon and LinkedIn, drafts replies and messages, and keeps the bookkeeping. You review every draft. It never sends anything by itself, and on some platforms you send the message yourself in your own browser.`,
						`It follows that you are responsible for what you send. A draft is a suggestion, and approving it makes it yours.`
					]
				},
				{
					heading: 'Your account',
					body: [
						`Keep your sign-in details to yourself and your account information accurate. An organization can have several members with different roles, and an owner or admin is responsible for who they invite.`
					]
				},
				{
					heading: 'What you may not use it for',
					body: [
						`Using Pitchbox does not exempt you from the rules of the platform you are posting to.`
					],
					bullets: [
						`No spam, no bulk unsolicited messaging, no impersonation.`,
						`No breaking the terms of Reddit, Hacker News, Mastodon or LinkedIn, and no using the product to work around a rate limit, a block or a ban on those platforms.`,
						`No unlawful, harassing, deceptive or infringing content, and no content about a person who has asked not to be contacted.`,
						`No reselling the hosted service or sharing one seat across a team.`,
						`We can suspend an account that does these things, and will say why.`
					]
				},
				{
					heading: 'Plans, payment and tax',
					body: [
						`There is a Free plan that does not expire, and paid plans billed monthly or annually. Each plan carries limits, published on the pricing page; when a limit is reached the action is refused until the next period or an upgrade, rather than silently degraded or billed as an extra.`,
						`Payment is handled by Stripe as the merchant of record: your purchase of the subscription is contracted with Stripe, which invoices you, receipts you and handles the tax. Prices are shown without tax, and the tax for your country is added at checkout. A subscription renews automatically until it is cancelled.`,
						`Cancelling takes effect at the end of the period you have already paid for, and the organization then continues on the Free plan. If a payment fails you keep your plan for 14 days while Stripe retries; after that the organization falls back to Free, with its data intact.`
					]
				},
				{
					heading: 'Refunds and the right of withdrawal',
					body: [
						`If you are a consumer in the European Union you have 14 days to withdraw from a purchase. Because a subscription gives you access immediately, starting to use it is a request for immediate performance.`,
						`Either way, ask: write to ${SUPPORT_EMAIL} or to Stripe's own Link support, which can refund a transaction directly. We would rather refund an unhappy customer than argue about it.`
					]
				},
				{
					heading: 'Your data and ours',
					body: [
						`Your projects, drafts and contacts are yours. You grant us only what is needed to run the service for you: storing that content, and sending the prompt for a draft to a model provider so it can be written. The privacy policy says exactly who that is.`,
						`The software itself is ours and is published under the AGPL-3.0, which means you can always take it and run it yourself.`
					]
				},
				{
					heading: 'Availability and liability',
					body: [
						`The service is provided as it is, with no promised uptime. It runs on a single hosted deployment and there will be maintenance windows and occasional failures.`,
						`To the extent the law allows, we are not liable for indirect or consequential loss, and our total liability is limited to what you paid in the twelve months before the claim. Nothing here limits a right you have as a consumer, or liability that cannot be limited.`
					]
				},
				{
					heading: 'Ending it',
					body: [
						`You can stop at any time from the billing settings, and ask for your data to be exported or deleted. We can end an account for a serious or repeated breach of these terms, or with reasonable notice if the hosted service is discontinued, in which case unused prepaid time is refunded.`
					]
				},
				{
					heading: 'Changes and governing law',
					body: [
						`If these terms change in substance, account holders are told by email before the change takes effect, and continuing to use the service after that is acceptance.`,
						`Italian law governs these terms. If you are a consumer you keep the right to bring a claim in the courts of your own place of residence.`
					]
				}
			]
		}
	},
	it: {
		backToHome: 'Torna alla home',
		updatedLabel: 'Ultimo aggiornamento',
		privacy: {
			title: 'Informativa privacy - Pitchbox',
			description:
				"Quali dati conserva l'app Pitchbox in cloud, chi li tratta, per quanto tempo restano e come farli cancellare.",
			heading: 'Informativa privacy',
			updated: LEGAL_UPDATED.it,
			sections: [
				{
					heading: 'A cosa si applica',
					body: [
						`Questa informativa riguarda l'app in cloud su app.pitchbox.app e questo sito. Se installi Pitchbox da te, con licenza AGPL, non ti riguarda: la tua installazione conserva i dati sulla tua infrastruttura e il titolare del trattamento sei tu, non noi.`,
						`Per qualsiasi cosa relativa a questa informativa, comprese le richieste di accesso o cancellazione, scrivi a ${PRIVACY_EMAIL}. Per tutto il resto c'è ${SUPPORT_EMAIL}.`
					]
				},
				{
					heading: "Quali dati conserva l'app",
					body: [
						`Solo quelli che servono al prodotto per funzionare. Non c'è profilazione, non c'è pubblicità, e nulla viene venduto o condiviso per il marketing di terzi.`
					],
					bullets: [
						`Il tuo account: username, indirizzo email, la password sotto forma di hash (mai la password stessa) e se l'indirizzo è stato verificato.`,
						`La tua organizzazione: il nome, il tetto di spesa e il limite di run in parallelo.`,
						`Gli account delle piattaforme che colleghi: handle e nome visualizzato, più la credenziale necessaria ad agire come quell'account. Il token Mastodon è cifrato a riposo con AES-256-GCM, e allo stesso modo la sessione del browser per Reddit.`,
						`Le bozze e la loro storia: il testo scritto dall'agente, il post di partenza, le tue modifiche e se l'hai approvata, rifiutata o inviata.`,
						`Lo storico dei contatti: quale handle è stato contattato, da quale account e quando. È quello che evita di contattare due volte la stessa persona.`,
						`I post che il pannello integrato ha osservato su LinkedIn, se lo attivi: URL e identificativo del post, handle e nome dell'autore, testo del post. Solo dalle pagine che hai aperto tu.`,
						`I dati dei run: cosa ha fatto l'agente, quanto è durato e quanto è costato.`,
						`I dati di sicurezza: le tue sessioni e i tentativi di accesso falliti, registrati su username o su fascia di IP per limitare gli attacchi a forza bruta.`
					]
				},
				{
					heading: 'Cosa non fa',
					body: [
						`Questo sito non usa cookie, non carica script di terze parti e non ha analytics. I font sono serviti da questo dominio, non da una rete di font.`,
						`L'app non ha servizi di analytics, non registra le sessioni e non usa un servizio di error reporting: non contiene alcun SDK di terze parti. I log restano sul server che li ha prodotti.`,
						`Niente viene mai inviato al tuo posto. Ogni messaggio aspetta la tua approvazione e, su Reddit e Hacker News, sei tu a inviarlo.`
					]
				},
				{
					heading: 'Chi altro tratta i dati',
					body: [`L'app in cloud si appoggia a questi fornitori, e a nessun altro:`],
					bullets: [
						`Netcup (Germania): il server e il database su cui gira l'app.`,
						`Stripe, incluso Link: i pagamenti. Stripe è il venditore per l'abbonamento, emette fattura e ricevuta e si occupa dell'imposta. I dati della carta si inseriscono su una pagina di Stripe e non arrivano mai a noi.`,
						`Vercel AI Gateway, e tramite esso il fornitore di modelli che risponde a un run: il prompt di una bozza, che contiene il post di partenza e il brief della campagna, viene inviato lì per la generazione.`,
						`Resend: le email transazionali, come il reset della password o la verifica dell'indirizzo.`,
						`Cloudflare: il DNS del dominio e l'inoltro dietro l'indirizzo di supporto.`
					]
				},
				{
					heading: 'Le piattaforme che colleghi',
					body: [
						`Quando colleghi Reddit, Hacker News o Mastodon, l'app legge i contenuti pubblici che le hai indicato, usando l'API o le pagine pubbliche della piattaforma, e scrive solo ciò che approvi.`,
						`LinkedIn è diverso per scelta. Non esiste alcun accesso a LinkedIn dal lato server. Il pannello nel browser legge la pagina che hai già aperto, invia quello che ha letto al tuo account Pitchbox e non fa mai richieste a LinkedIn, non clicca e non invia nulla per te, e non legge i cookie di LinkedIn.`
					]
				},
				{
					heading: 'Per quanto tempo restano',
					body: [`Le righe vecchie vengono eliminate automaticamente, ogni ora:`],
					bullets: [
						`Post osservati su LinkedIn: 3 giorni.`,
						`Eventi dei run: 30 giorni. Consegne dei webhook: 30 giorni.`,
						`Eventi delle bozze, e bozze inviate, rifiutate o con risposta: 90 giorni.`,
						`Lo storico dei contatti resta finché esiste il progetto, perché è la base della deduplicazione e della blocklist. Cancellando il progetto si cancella anche quello.`,
						`Account, organizzazioni, progetti, campagne e account collegati restano finché non li cancelli o non ce lo chiedi.`
					]
				},
				{
					heading: 'I tuoi diritti',
					body: [
						`Puoi chiedere una copia dei tuoi dati, la loro correzione, l'esportazione o la cancellazione, e puoi opporti a un trattamento specifico. Scrivi a ${PRIVACY_EMAIL} e avrai una risposta entro 30 giorni.`,
						`Cancellare l'account cancella le tue organizzazioni, i progetti, le bozze e gli account collegati. Dove una copia è già uscita dai nostri sistemi, per esempio una fattura conservata da Stripe perché la normativa fiscale lo richiede, quella copia segue le regole di conservazione di chi la detiene e te lo diremo.`,
						`I dati dell'app risiedono in Germania. Stripe e i fornitori di modelli possono trattare dati fuori dall'Unione Europea con le proprie garanzie di trasferimento.`
					]
				},
				{
					heading: 'Modifiche',
					body: [
						`Se questa informativa cambia nella sostanza, cambia la data in alto e i titolari di un account vengono avvisati per email prima che la modifica abbia effetto.`
					]
				}
			]
		},
		terms: {
			title: 'Termini di servizio - Pitchbox',
			description:
				"I termini per usare l'app Pitchbox in cloud: cosa fa il servizio, cosa non puoi farne, come funzionano pagamento e disdetta.",
			heading: 'Termini di servizio',
			updated: LEGAL_UPDATED.it,
			sections: [
				{
					heading: 'Cosa stai accettando',
					body: [
						`Questi termini regolano l'app in cloud su app.pitchbox.app. Installare Pitchbox da sé è regolato dalla sua licenza, la AGPL-3.0, e non da questo documento.`,
						`Domande, e qualunque cosa richieda una persona: ${SUPPORT_EMAIL}.`
					]
				},
				{
					heading: 'Cosa fa il servizio',
					body: [
						`Pitchbox cerca conversazioni pubbliche su Reddit, Hacker News, Mastodon e LinkedIn, scrive bozze di risposte e messaggi e tiene la contabilità di quello che è stato fatto. Ogni bozza la rivedi tu. Non invia mai nulla da solo e su alcune piattaforme il messaggio lo invii tu, dal tuo browser.`,
						`Ne consegue che di quello che invii sei responsabile tu. Una bozza è un suggerimento, e approvarla la rende tua.`
					]
				},
				{
					heading: 'Il tuo account',
					body: [
						`Tieni per te le credenziali e aggiornate le informazioni dell'account. Un'organizzazione può avere più membri con ruoli diversi, e chi è owner o admin è responsabile di chi invita.`
					]
				},
				{
					heading: 'Cosa non puoi farne',
					body: [`Usare Pitchbox non ti esonera dalle regole della piattaforma su cui pubblichi.`],
					bullets: [
						`Niente spam, niente messaggi non richiesti in massa, niente impersonificazione.`,
						`Niente violazioni dei termini di Reddit, Hacker News, Mastodon o LinkedIn, e niente uso del prodotto per aggirare un rate limit, un blocco o un ban su quelle piattaforme.`,
						`Niente contenuti illeciti, molesti, ingannevoli o che violino diritti di terzi, e niente contenuti rivolti a chi ha chiesto di non essere contattato.`,
						`Niente rivendita del servizio in cloud e niente condivisione di un singolo posto con un intero team.`,
						`Possiamo sospendere un account che fa queste cose, dicendo perché.`
					]
				},
				{
					heading: 'Piani, pagamento e imposte',
					body: [
						`Esiste un piano Free che non scade, e piani a pagamento con addebito mensile o annuale. Ogni piano ha dei limiti, pubblicati sulla pagina dei prezzi; al raggiungimento del limite l'azione viene rifiutata fino al periodo successivo o a un upgrade, invece di essere degradata in silenzio o addebitata come extra.`,
						`Il pagamento è gestito da Stripe come venditore: l'acquisto dell'abbonamento è concluso con Stripe, che emette fattura e ricevuta e si occupa dell'imposta. I prezzi sono esposti senza imposta, e l'imposta del tuo Paese viene aggiunta al checkout. L'abbonamento si rinnova automaticamente fino alla disdetta.`,
						`La disdetta ha effetto alla fine del periodo già pagato, e l'organizzazione continua sul piano Free. Se un pagamento fallisce mantieni il tuo piano per 14 giorni mentre Stripe riprova; dopo, l'organizzazione torna al piano Free con i dati intatti.`
					]
				},
				{
					heading: 'Rimborsi e diritto di recesso',
					body: [
						`Se sei un consumatore nell'Unione Europea hai 14 giorni per recedere da un acquisto. Poiché l'abbonamento dà accesso immediato, iniziare a usarlo costituisce richiesta di esecuzione immediata.`,
						`In ogni caso, chiedi: scrivi a ${SUPPORT_EMAIL} oppure al supporto Link di Stripe, che può rimborsare direttamente una transazione. Preferiamo rimborsare un cliente insoddisfatto piuttosto che discuterne.`
					]
				},
				{
					heading: 'I tuoi dati e i nostri',
					body: [
						`Progetti, bozze e contatti sono tuoi. Ci concedi solo quanto serve a farti funzionare il servizio: conservare quei contenuti e inviare il prompt di una bozza a un fornitore di modelli perché la scriva. L'informativa privacy dice esattamente chi sia.`,
						`Il software è nostro ed è pubblicato con licenza AGPL-3.0, quindi puoi sempre prenderlo e installarlo per conto tuo.`
					]
				},
				{
					heading: 'Disponibilità e responsabilità',
					body: [
						`Il servizio è fornito così com'è, senza uptime garantito. Gira su un unico deployment e ci saranno finestre di manutenzione e guasti occasionali.`,
						`Nei limiti consentiti dalla legge non rispondiamo di danni indiretti o consequenziali, e la nostra responsabilità complessiva è limitata a quanto hai pagato nei dodici mesi precedenti la contestazione. Nulla qui limita un diritto che hai come consumatore, né una responsabilità che non può essere limitata.`
					]
				},
				{
					heading: 'Chiudere il rapporto',
					body: [
						`Puoi smettere quando vuoi dalle impostazioni di fatturazione, e chiedere l'esportazione o la cancellazione dei tuoi dati. Possiamo chiudere un account per violazioni gravi o ripetute di questi termini, o con un preavviso ragionevole se il servizio in cloud viene interrotto, e in quel caso il periodo prepagato e non usato viene rimborsato.`
					]
				},
				{
					heading: 'Modifiche e legge applicabile',
					body: [
						`Se questi termini cambiano nella sostanza, i titolari di un account vengono avvisati per email prima che la modifica abbia effetto, e continuare a usare il servizio dopo quel momento vale come accettazione.`,
						`Questi termini sono regolati dalla legge italiana. Se sei un consumatore conservi il diritto di rivolgerti al giudice del tuo luogo di residenza.`
					]
				}
			]
		}
	}
};
