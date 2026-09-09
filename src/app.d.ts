// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	// Replaced with a literal at build time by vite.config.ts's `define` - see
	// src/routes/healthz/+server.ts. Never read process.env for these; that is the
	// hole this exists to close.
	const __APP_VERSION__: string | null;
	const __APP_COMMIT__: string | null;
}

export {};
