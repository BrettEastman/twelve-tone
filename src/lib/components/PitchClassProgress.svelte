<script lang="ts">
	import { PC_NAMES, pretty, type SpelledNote } from '$lib/spelling';
	import { rowState } from '$lib/rowState.svelte';

	// Chips in chromatic order; entered pcs show the user's own spelling and
	// their position in the row.
	const chips = $derived(
		PC_NAMES.map((name, pc) => {
			const index = rowState.entries.findIndex((e: SpelledNote) => e.pc === pc);
			const entry = index === -1 ? null : rowState.entries[index];
			return {
				pc,
				label: entry ? pretty(entry) : name,
				order: index === -1 ? null : index + 1,
				flash: rowState.rejectedPc === pc
			};
		})
	);
</script>

<div class="progress">
	<div class="chips">
		{#each chips as chip (chip.pc)}
			<span class="chip" class:entered={chip.order !== null} class:flash={chip.flash}>
				{#if chip.order !== null}
					<span class="order">{chip.order}</span>
				{/if}
				{chip.label}
			</span>
		{/each}
	</div>
	<span class="counter">{rowState.entries.length} / 12</span>
</div>

<style>
	.progress {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.65rem;
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius-pill);
		font-size: var(--text-xs);
		color: var(--color-muted);
		background: transparent;
		transition: all 0.15s ease;
	}

	.chip.entered {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: #fff;
	}

	.chip.flash {
		animation: flash 0.45s ease-out 2;
	}

	.order {
		font-size: 0.65rem;
		opacity: 0.7;
	}

	.counter {
		margin-left: auto;
		font-size: var(--text-sm);
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
	}

	@keyframes flash {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(160, 66, 39, 0);
		}
		50% {
			box-shadow: 0 0 0 4px rgba(160, 66, 39, 0.45);
			border-color: #a04227;
		}
	}
</style>
