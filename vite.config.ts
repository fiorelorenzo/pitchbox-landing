import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';

// SvelteKit's Vite plugin snapshots process.env via loadEnv() during config resolution,
// before any route, component or test file's own code runs, so the default for this
// build-time flag has to live here (same reasoning canonry-landing's vite.config.ts
// gives for its own DATABASE_URL fallback). #423 decided the switch on the app host is
// still `invite`, so an unset PUBLIC_SIGNUP_OPEN must resolve to the invite copy, not to
// whatever `$env/static/public` would otherwise do with a genuinely missing variable.
process.env.PUBLIC_SIGNUP_OPEN ??= 'false';

// Same reasoning, same mechanism, for the app-path redirect (#422 follow-up, the apex
// flip): a self-hoster who forks this repo may run the app on a different host, so the
// default has to be overridable and still has to exist before src/hooks.server.ts's
// own `$env/static/public` import resolves.
process.env.PUBLIC_APP_ORIGIN ??= 'https://app.pitchbox.app';

// __APP_VERSION__ / __APP_COMMIT__: the deploy health gate (see docker/ in the sibling
// deploy PR) compares what /healthz reports against what it just built, which only
// proves anything if the served value cannot change without a rebuild. Reading
// `process.env.APP_VERSION` at *request* time let a mounted runtime env override it -
// proven on the box: starting the built image with APP_VERSION=SHOULD_NOT_APPEAR made
// /healthz report exactly that. `define` replaces these identifiers with a literal at
// build time instead, so nothing short of a rebuild can change the served value.
// Unset in dev (no real build), which is honest rather than inventing a fake version.
const buildVersion = process.env.APP_VERSION ?? null;
const buildCommit = process.env.APP_COMMIT ?? null;

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(buildVersion),
		__APP_COMMIT__: JSON.stringify(buildCommit)
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
