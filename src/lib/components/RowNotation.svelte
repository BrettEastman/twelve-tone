<script lang="ts">
	import { Accidental, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow';
	import { toVexKey, type Clef, type SpelledNote } from '$lib/spelling';

	interface Props {
		notes: SpelledNote[];
		clef?: Clef;
		highlightIndex?: number | null;
		height?: number;
	}

	let { notes, clef = 'treble', highlightIndex = null, height = 160 }: Props = $props();

	let container: HTMLDivElement | undefined = $state();

	const HIGHLIGHT = '#2f5f97'; // --color-accent; SVG attrs can't use CSS vars here

	// Re-rendering the whole stave on highlight change is well under a frame
	// for twelve notes, and avoids depending on VexFlow's SVG internals.
	const renderNotation = () => {
		if (!container) return;
		container.innerHTML = '';

		const width = Math.max(360, 100 + notes.length * 58);

		const renderer = new Renderer(container, Renderer.Backends.SVG);
		renderer.resize(width, height);
		const context = renderer.getContext();
		context.setFont('Arial', 10);

		const stave = new Stave(10, 40, width - 20);
		stave.addClef(clef).setContext(context).draw();

		if (notes.length === 0) return;

		const staveNotes = notes.map((note, i) => {
			const staveNote = new StaveNote({ keys: [toVexKey(note)], duration: 'q', clef });
			if (note.accidental) {
				staveNote.addModifier(new Accidental(note.accidental));
			}
			if (i === highlightIndex) {
				staveNote.setStyle({ fillStyle: HIGHLIGHT, strokeStyle: HIGHLIGHT });
			}
			return staveNote;
		});

		const voice = new Voice({ numBeats: notes.length, beatValue: 4 });
		voice.setStrict(false);
		voice.addTickables(staveNotes);

		new Formatter().joinVoices([voice]).format([voice], width - 100);
		voice.draw(context, stave);
	};

	$effect(() => {
		// Explicitly list dependencies to watch
		const _ = [notes, clef, highlightIndex, container];

		if (container) {
			renderNotation();
		}
	});
</script>

<div class="notation-container" bind:this={container}></div>

<style>
	.notation-container {
		width: 100%;
		overflow-x: auto;
		background-color: #ffffff;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		min-height: 120px;
		display: flex;
		align-items: center;
	}
</style>
