<script lang="ts">
	import MatrixGrid from '$lib/components/MatrixGrid.svelte';
	import PitchClassProgress from '$lib/components/PitchClassProgress.svelte';
	import RowFormPanel from '$lib/components/RowFormPanel.svelte';
	import StaffInput from '$lib/components/StaffInput.svelte';
	import { buildSpellingMap } from '$lib/spelling';
	import { buildMatrix } from '$lib/theory';
	import { rowState } from '$lib/rowState.svelte';

	const complete = $derived(rowState.entries.length === 12);
	const row = $derived(rowState.entries.map((e) => e.pc));
	const matrix = $derived(complete ? buildMatrix(row) : null);
	const spellingMap = $derived(buildSpellingMap(rowState.entries));
</script>

<section class="card" class:complete>
	<h2>Your row</h2>
	<StaffInput />
	<PitchClassProgress />
</section>

{#if matrix}
	<section class="card matrix-card">
		<h2>The matrix</h2>
		<p class="card-hint">
			Read primes (P) left to right, inversions (I) top to bottom, retrogrades (R) right to
			left, and retrograde inversions (RI) bottom to top. Click any label to open that form.
		</p>
		<MatrixGrid {matrix} {spellingMap} />
	</section>
{/if}

{#if matrix && rowState.selectedForm}
	<section class="card">
		<RowFormPanel {row} entries={rowState.entries} {spellingMap} form={rowState.selectedForm} />
	</section>
{/if}

<style>
	.card {
		background: var(--color-paper-strong);
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		box-shadow: var(--shadow-soft);
		margin-bottom: var(--space-5);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.card.complete {
		border-color: var(--color-accent-soft);
	}

	.card h2 {
		margin: 0;
		font-size: var(--text-xl);
	}

	.card-hint {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--text-sm);
	}

	.matrix-card {
		animation: fade-in 0.4s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
