<script lang="ts">
	import '../styles/tokens.css';
	import '../styles/base.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Twelve-Tone Matrix</title>
</svelte:head>

<div class="shell">
	<header class="site-header">
		<h1>Twelve-Tone Matrix</h1>
		<p class="tagline">
			Enter a twelve-tone row on the staff, then explore its matrix — every prime, inversion,
			retrograde, and retrograde inversion, in notation and sound.
		</p>
	</header>

	<main>
		{@render children()}
	</main>

	<footer class="site-footer">
		<p>After the method of Arnold Schoenberg</p>
	</footer>
</div>

<style>
	.shell {
		max-width: 64rem;
		margin: 0 auto;
		padding: var(--space-5) var(--space-4) var(--space-7);
	}

	.site-header {
		text-align: center;
		margin-bottom: var(--space-6);
	}

	.site-header h1 {
		font-size: 2.2rem;
		margin: 0 0 var(--space-2);
	}

	.tagline {
		color: var(--color-muted);
		font-size: var(--text-md);
		max-width: 38rem;
		margin: 0 auto;
	}

	.site-footer {
		margin-top: var(--space-7);
		text-align: center;
		color: var(--color-muted);
		font-size: var(--text-sm);
		font-style: italic;
	}
</style>
