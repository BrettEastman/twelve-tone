<script lang="ts">
	import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
	import { toVexKey, type AccidentalSym, type Clef, type Letter } from '$lib/spelling';
	import {
		addNote,
		clearRow,
		MAX_ROW_LENGTH,
		MIN_ROW_LENGTH,
		removeNoteAt,
		rowState,
		setAccidentalMode,
		setClef,
		setRowLength,
		toggleEraseMode
	} from '$lib/rowState.svelte';

	const lengthOptions = Array.from(
		{ length: MAX_ROW_LENGTH - MIN_ROW_LENGTH + 1 },
		(_, i) => MIN_ROW_LENGTH + i
	);

	const LOGICAL_WIDTH = 760;
	const LOGICAL_HEIGHT = 190;

	const LETTERS = 'CDEFGAB';

	// Diatonic index: one step per staff position (line or space).
	const diatonicIndex = (letter: Letter, octave: number): number =>
		octave * 7 + LETTERS.indexOf(letter);

	// Top stave line and clickable range (a few ledger positions each way).
	const CLEF_GEOMETRY: Record<Clef, { topLine: number; min: number; max: number }> = {
		treble: {
			topLine: diatonicIndex('F', 5),
			min: diatonicIndex('A', 3),
			max: diatonicIndex('C', 6)
		},
		bass: {
			topLine: diatonicIndex('A', 3),
			min: diatonicIndex('C', 2),
			max: diatonicIndex('E', 4)
		}
	};

	let container: HTMLDivElement | undefined = $state();

	// Real geometry captured after each draw — the fix for hardcoded pixel math.
	let drawnStave: Stave | null = null;
	let drawnNotes: StaveNote[] = [];

	const renderNotation = () => {
		if (!container) return;
		container.innerHTML = '';

		const renderer = new Renderer(container, Renderer.Backends.SVG);
		renderer.resize(LOGICAL_WIDTH, LOGICAL_HEIGHT);
		const context = renderer.getContext();
		context.setFont('Arial', 10);

		const stave = new Stave(10, 40, LOGICAL_WIDTH - 20);
		stave.addClef(rowState.clef).setContext(context).draw();
		drawnStave = stave;

		if (rowState.entries.length === 0) {
			drawnNotes = [];
			return;
		}

		const staveNotes = rowState.entries.map((note) => {
			const staveNote = new StaveNote({
				keys: [toVexKey(note)],
				duration: 'q',
				clef: rowState.clef
			});
			if (note.accidental) {
				staveNote.addModifier(new Accidental(note.accidental));
			}
			return staveNote;
		});

		const voice = new Voice({ numBeats: staveNotes.length, beatValue: 4 });
		voice.setStrict(false);
		voice.addTickables(staveNotes);

		new Formatter().joinVoices([voice]).format([voice], LOGICAL_WIDTH - 120);
		voice.draw(context, stave);
		drawnNotes = staveNotes;
	};

	$effect(() => {
		// Explicitly list dependencies to watch
		const _ = [rowState.entries.length, rowState.clef, container];

		if (container) {
			renderNotation();
		}
	});

	const handleStaffClick = (event: MouseEvent) => {
		if (!container || !drawnStave) return;
		const svg = container.querySelector('svg');
		if (!svg) return;

		// Map client pixels to VexFlow's logical coordinates — handles any CSS
		// scaling or browser zoom via the rendered/logical size ratio.
		const rect = svg.getBoundingClientRect();
		const x = (event.clientX - rect.left) * (LOGICAL_WIDTH / rect.width);
		const y = (event.clientY - rect.top) * (LOGICAL_HEIGHT / rect.height);

		if (rowState.eraseMode) {
			eraseNearest(x);
			return;
		}

		if (rowState.entries.length >= rowState.rowLength) return;

		// One diatonic step per half line-spacing, measured from the top line.
		const topLineY = drawnStave.getYForLine(0);
		const halfStep = drawnStave.getSpacingBetweenLines() / 2;
		const stepsBelowTop = Math.round((y - topLineY) / halfStep);

		const { topLine, min, max } = CLEF_GEOMETRY[rowState.clef];
		const index = topLine - stepsBelowTop;
		if (index < min || index > max) return;
		if (x < drawnStave.getNoteStartX()) return;

		const letter = LETTERS[index % 7] as Letter;
		const octave = Math.floor(index / 7);
		addNote({ letter, octave, accidental: rowState.accidentalMode });
	};

	const eraseNearest = (x: number) => {
		if (drawnNotes.length === 0) return;
		let nearest = 0;
		let nearestDistance = Infinity;
		drawnNotes.forEach((note, i) => {
			const distance = Math.abs(note.getAbsoluteX() - x);
			if (distance < nearestDistance) {
				nearestDistance = distance;
				nearest = i;
			}
		});
		if (nearestDistance < 60) {
			removeNoteAt(nearest);
		}
	};

	const accidentalOptions: { value: AccidentalSym; label: string; name: string }[] = [
		{ value: null, label: '♮', name: 'Natural' },
		{ value: '#', label: '♯', name: 'Sharp' },
		{ value: 'b', label: '♭', name: 'Flat' }
	];
</script>

<div class="staff-input">
	<div class="toolbar">
		<label class="clef-select">
			Clef
			<select
				value={rowState.clef}
				onchange={(e) => setClef(e.currentTarget.value as Clef)}
			>
				<option value="treble">Treble</option>
				<option value="bass">Bass</option>
			</select>
		</label>

		<label class="clef-select">
			Length
			<select
				value={rowState.rowLength}
				onchange={(e) => setRowLength(Number(e.currentTarget.value))}
			>
				{#each lengthOptions as n (n)}
					<option value={n}>{n}</option>
				{/each}
			</select>
		</label>

		<div class="accidental-group" role="group" aria-label="Accidental">
			{#each accidentalOptions as option (option.name)}
				<button
					type="button"
					class="toolbar-button"
					class:active={rowState.accidentalMode === option.value && !rowState.eraseMode}
					title={option.name}
					onclick={() => setAccidentalMode(option.value)}
				>
					{option.label}
					<span class="button-name">{option.name}</span>
				</button>
			{/each}
		</div>

		<div class="edit-group">
			<button
				type="button"
				class="toolbar-button"
				class:active={rowState.eraseMode}
				onclick={toggleEraseMode}
			>
				✕ <span class="button-name">Erase</span>
			</button>
			<button
				type="button"
				class="toolbar-button"
				disabled={rowState.entries.length === 0}
				onclick={clearRow}
			>
				<span class="button-name">Clear all</span>
			</button>
		</div>
	</div>

	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="notation-container"
		class:erasing={rowState.eraseMode}
		bind:this={container}
		onclick={handleStaffClick}
	></div>

	<p class="hint" class:warning={rowState.inputMessage}>
		{#if rowState.inputMessage}
			{rowState.inputMessage}
		{:else if rowState.entries.length === rowState.rowLength}
			Row complete — click a label around the matrix below to see and hear that form.
		{:else if rowState.eraseMode}
			Erase mode: click a note to remove it.
		{:else}
			Click the staff to place note {rowState.entries.length + 1} of {rowState.rowLength}.
			Choose ♯ or ♭ first for accidentals.
		{/if}
	</p>
</div>

<style>
	.staff-input {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}

	.clef-select {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-muted);
	}

	.clef-select select {
		padding: 0.35rem 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-paper-strong);
		color: var(--color-ink);
	}

	.accidental-group,
	.edit-group {
		display: flex;
		gap: var(--space-1);
	}

	.edit-group {
		margin-left: auto;
	}

	.toolbar-button {
		padding: 0.35rem 0.8rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		background: var(--color-paper-strong);
		color: var(--color-ink);
		cursor: pointer;
		font-size: var(--text-md);
		transition: all 0.15s ease;
	}

	.toolbar-button:hover:not(:disabled) {
		border-color: var(--color-accent-soft);
	}

	.toolbar-button.active {
		background: var(--color-ink);
		border-color: var(--color-ink);
		color: #fff;
	}

	.toolbar-button:disabled {
		opacity: 0.45;
		cursor: default;
	}

	.button-name {
		font-size: var(--text-xs);
	}

	.notation-container {
		width: 100%;
		overflow-x: auto;
		background-color: #ffffff;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.notation-container.erasing {
		cursor: crosshair;
	}

	.hint {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--color-muted);
		min-height: 1.4em;
	}

	.hint.warning {
		color: #a04227;
	}
</style>
