<script lang="ts">
	import { playRowForm, type PlaybackHandle } from '$lib/audio';
	import { pretty, spellForm, toPitch, type Spelling, type SpelledNote } from '$lib/spelling';
	import { FORM_NAMES, rowForm, type FormId, type PitchClass, type Row } from '$lib/theory';
	import { clearSelection, rowState } from '$lib/rowState.svelte';
	import RowNotation from './RowNotation.svelte';

	interface Props {
		row: Row; // P0 pitch classes
		entries: SpelledNote[]; // user's original notes, with their octaves
		spellingMap: Map<PitchClass, Spelling>;
		form: FormId;
	}

	let { row, entries, spellingMap, form }: Props = $props();

	// P at the original transposition shows the row exactly as entered
	// (user's octaves); every other form uses the fixed-octave policy.
	const notes = $derived(
		form.kind === 'P' && form.n === row[0]
			? entries
			: spellForm(rowForm(row, form), spellingMap, rowState.clef)
	);

	const title = $derived.by(() => {
		const first = notes[0];
		return `${form.kind}${form.n} — ${FORM_NAMES[form.kind]} starting on ${pretty(first)}`;
	});

	let playing = $state(false);
	let highlightIndex: number | null = $state(null);
	let playback: PlaybackHandle | null = null;

	const stopPlayback = () => {
		playback?.cancel();
		playback = null;
		playing = false;
	};

	const handlePlay = async () => {
		if (playing) {
			stopPlayback();
			return;
		}
		playing = true;
		try {
			playback = await playRowForm(
				notes.map(toPitch),
				(index) => {
					highlightIndex = index;
					if (index === null) {
						playing = false;
						playback = null;
					}
				}
			);
		} catch (error) {
			console.error(error);
			playing = false;
		}
	};

	// Stop sound and highlights whenever the selected form changes or the
	// panel unmounts.
	$effect(() => {
		const _ = form;
		return () => stopPlayback();
	});
</script>

<div class="panel">
	<div class="panel-header">
		<h3>{title}</h3>
		<button type="button" class="close-button" onclick={clearSelection} aria-label="Close panel">
			✕
		</button>
	</div>

	<RowNotation {notes} clef={rowState.clef} {highlightIndex} />

	<div class="panel-actions">
		<button type="button" class="play-button" class:playing onclick={handlePlay}>
			{playing ? '■ Stop' : '▶ Play'}
		</button>
		<span class="note-names">
			{notes.map((n) => pretty(n)).join(' · ')}
		</span>
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.panel-header h3 {
		margin: 0;
		font-size: var(--text-lg);
	}

	.close-button {
		border: 1px solid var(--color-border);
		background: transparent;
		color: var(--color-muted);
		border-radius: var(--radius-pill);
		width: 2rem;
		height: 2rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.close-button:hover {
		color: var(--color-ink);
		border-color: var(--color-ink);
	}

	.panel-actions {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		flex-wrap: wrap;
	}

	.play-button {
		background-color: var(--color-ink);
		color: #fff;
		padding: 0.55rem 1.5rem;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-ink);
		font-weight: 600;
		font-size: var(--text-md);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.play-button:hover {
		background-color: #3a3a37;
		transform: translateY(-1px);
	}

	.play-button.playing {
		background-color: var(--color-accent);
		border-color: var(--color-accent);
		animation: pulse 0.5s ease-out;
	}

	@keyframes pulse {
		0% {
			box-shadow: 0 0 0 0 rgba(47, 95, 151, 0.5);
		}
		70% {
			box-shadow: 0 0 0 10px rgba(47, 95, 151, 0);
		}
		100% {
			box-shadow: 0 0 0 0 rgba(47, 95, 151, 0);
		}
	}

	.note-names {
		color: var(--color-muted);
		font-size: var(--text-sm);
	}
</style>
