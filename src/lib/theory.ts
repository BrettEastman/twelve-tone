// Pure pitch-class math for twelve-tone rows. No UI, no dependencies —
// everything here is arrays of numbers mod 12.

export type PitchClass = number; // 0-11
export type Row = PitchClass[]; // length 12, each pc exactly once

export type FormKind = 'P' | 'I' | 'R' | 'RI';

// n is the pc of the form's starting note (for R/RI, the starting note of
// the underlying P/I — the standard labeling convention, so R4 is P4 played
// backwards).
export interface FormId {
	kind: FormKind;
	n: PitchClass;
}

export const mod12 = (x: number): number => ((x % 12) + 12) % 12;

export const isCompleteRow = (row: Row): boolean =>
	row.length === 12 && new Set(row.map(mod12)).size === 12;

// Inversion about the row's first note: I0 starts on the same pc as P0 and
// mirrors every interval.
export const invert = (row: Row): Row => row.map((pc) => mod12(2 * row[0] - pc));

// The traditional 12x12 matrix. Row 0 (left to right) is P0 — the row as
// entered; column 0 (top to bottom) is I0. Read rows right-to-left for
// retrogrades, columns bottom-to-top for retrograde inversions.
export const buildMatrix = (row: Row): PitchClass[][] => {
	const inv = invert(row);
	return inv.map((start) => row.map((pc) => mod12(pc - row[0] + start)));
};

// Edge labels, by starting pitch class: left edge P, right edge R (same n),
// top edge I, bottom edge RI (same n).
export interface MatrixLabels {
	p: PitchClass[]; // per matrix row; also the R labels
	i: PitchClass[]; // per matrix column; also the RI labels
}

export const matrixLabels = (matrix: PitchClass[][]): MatrixLabels => ({
	p: matrix.map((r) => r[0]),
	i: matrix[0].slice()
});

// Extract any of the 48 forms as pitch classes.
export const rowForm = (row: Row, form: FormId): Row => {
	const base = form.kind === 'I' || form.kind === 'RI' ? invert(row) : row;
	const transposed = base.map((pc) => mod12(pc - base[0] + form.n));
	return form.kind === 'R' || form.kind === 'RI' ? transposed.slice().reverse() : transposed;
};

export const FORM_NAMES: Record<FormKind, string> = {
	P: 'Prime',
	I: 'Inversion',
	R: 'Retrograde',
	RI: 'Retrograde Inversion'
};
