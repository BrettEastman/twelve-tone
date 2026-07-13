// Bridges pitch classes to notation and audio: note spelling, VexFlow keys,
// and scientific pitch strings for Tone.js.

import { mod12, type PitchClass, type Row } from './theory';

export type Letter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
export type AccidentalSym = '#' | 'b' | null;
export type Clef = 'treble' | 'bass';

export interface Spelling {
	letter: Letter;
	accidental: AccidentalSym;
}

export interface SpelledNote extends Spelling {
	pc: PitchClass;
	octave: number;
}

export const SEMITONES: Record<Letter, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

export const pcOf = (s: Spelling): PitchClass =>
	mod12(SEMITONES[s.letter] + (s.accidental === '#' ? 1 : s.accidental === 'b' ? -1 : 0));

// A complete row contains every pc exactly once, so the user's twelve entered
// notes define a total map pc -> spelling. Every derived form permutes the
// same twelve pcs, which means every note of every form reuses the user's own
// spelling — no respelling policy needed.
export const buildSpellingMap = (entries: SpelledNote[]): Map<PitchClass, Spelling> => {
	const map = new Map<PitchClass, Spelling>();
	for (const e of entries) {
		map.set(e.pc, { letter: e.letter, accidental: e.accidental });
	}
	return map;
};

// Default names for pcs the user hasn't entered yet (chips, fallbacks).
export const PC_NAMES: string[] = [
	'C',
	'C♯/D♭',
	'D',
	'D♯/E♭',
	'E',
	'F',
	'F♯/G♭',
	'G',
	'G♯/A♭',
	'A',
	'A♯/B♭',
	'B'
];

// Fixed octave keeps derived forms on the staff; the P0 panel uses the user's
// clicked octaves instead.
const FORM_OCTAVE: Record<Clef, number> = { treble: 4, bass: 3 };

export const spellForm = (
	pcs: Row,
	map: Map<PitchClass, Spelling>,
	clef: Clef
): SpelledNote[] =>
	pcs.map((pc) => {
		const spelling = map.get(pc);
		if (!spelling) throw new Error(`No spelling for pitch class ${pc}`);
		return { ...spelling, pc, octave: FORM_OCTAVE[clef] };
	});

export const toVexKey = (n: SpelledNote): string =>
	`${n.letter.toLowerCase()}${n.accidental ?? ''}/${n.octave}`;

// Scientific pitch, e.g. "Bb4" — Tone.js parses these natively (including
// Cb/B# with their octave-crossing meanings, consistent with notation).
export const toPitch = (n: SpelledNote): string => `${n.letter}${n.accidental ?? ''}${n.octave}`;

export const pretty = (s: Spelling): string =>
	`${s.letter}${s.accidental === '#' ? '♯' : s.accidental === 'b' ? '♭' : ''}`;

// Matrix cell text: the user's own spelling for that pc.
export const prettyPc = (pc: PitchClass, map: Map<PitchClass, Spelling>): string => {
	const s = map.get(pc);
	return s ? pretty(s) : PC_NAMES[pc];
};
