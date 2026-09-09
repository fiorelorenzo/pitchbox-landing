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

export default defineConfig({
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
