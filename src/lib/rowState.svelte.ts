// Shared reactive state for the row being composed. One module-level $state
// object imported everywhere — mutate only through the functions below.

import { pcOf, pretty, type AccidentalSym, type Clef, type SpelledNote } from './spelling';
import type { FormId } from './theory';

export interface RowStateShape {
	entries: SpelledNote[]; // P0 in entry order, max 12
	clef: Clef;
	accidentalMode: AccidentalSym; // toolbar selection; null = natural
	eraseMode: boolean;
	selectedForm: FormId | null;
	inputMessage: string | null; // transient feedback (e.g. duplicate rejected)
	rejectedPc: number | null; // chip to flash on duplicate
}

export const rowState = $state<RowStateShape>({
	entries: [],
	clef: 'treble',
	accidentalMode: null,
	eraseMode: false,
	selectedForm: null,
	inputMessage: null,
	rejectedPc: null
});

let messageTimer: ReturnType<typeof setTimeout> | undefined;

const flashMessage = (message: string, pc: number | null = null) => {
	rowState.inputMessage = message;
	rowState.rejectedPc = pc;
	clearTimeout(messageTimer);
	messageTimer = setTimeout(() => {
		rowState.inputMessage = null;
		rowState.rejectedPc = null;
	}, 2500);
};

export const addNote = (note: Omit<SpelledNote, 'pc'>): boolean => {
	if (rowState.entries.length >= 12) {
		flashMessage('The row already has all twelve notes.');
		return false;
	}
	const pc = pcOf(note);
	const existingIndex = rowState.entries.findIndex((e) => e.pc === pc);
	if (existingIndex !== -1) {
		const existing = rowState.entries[existingIndex];
		flashMessage(
			`${pretty(note)} is already in the row as ${pretty(existing)} (note ${existingIndex + 1}).`,
			pc
		);
		return false;
	}
	rowState.entries.push({ ...note, pc });
	rowState.selectedForm = null;
	rowState.inputMessage = null;
	rowState.rejectedPc = null;
	return true;
};

export const removeNoteAt = (index: number): void => {
	if (index < 0 || index >= rowState.entries.length) return;
	rowState.entries.splice(index, 1);
	rowState.selectedForm = null;
};

export const clearRow = (): void => {
	rowState.entries = [];
	rowState.selectedForm = null;
	rowState.inputMessage = null;
	rowState.rejectedPc = null;
	rowState.eraseMode = false;
};

export const setClef = (clef: Clef): void => {
	rowState.clef = clef;
};

export const setAccidentalMode = (mode: AccidentalSym): void => {
	rowState.accidentalMode = mode;
};

export const toggleEraseMode = (): void => {
	rowState.eraseMode = !rowState.eraseMode;
};

export const selectForm = (form: FormId): void => {
	rowState.selectedForm = form;
};

export const clearSelection = (): void => {
	rowState.selectedForm = null;
};
