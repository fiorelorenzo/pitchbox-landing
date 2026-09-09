<script lang="ts">
	/** One button, either weight. `primary` carries the filled `--primary` token,
	 * `secondary` the bordered `--card` token - equal size, equal prominence, per
	 * #423's decision that self-hosting is an equal-weight second path rather than a
	 * footnote under the account CTA. */
	import type { CtaLink } from '$lib/cta';

	let { cta, variant }: { cta: CtaLink; variant: 'primary' | 'secondary' } = $props();
</script>

{#if variant === 'primary'}
	<!-- cta.href is always an absolute https:// URL (REGISTER_URL, $lib/cta.ts), never an
	     internal route, so it needs no resolve() - eslint can't prove that statically. -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		href={cta.href}
		class="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
	>
		{cta.label}
	</a>
{:else}
	<a
		href={cta.href}
		class="rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-secondary"
	>
		{cta.label}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{/if}
