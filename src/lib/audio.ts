import * as Tone from 'tone';

let synth: Tone.Synth | null = null;
let unmuteElement: HTMLAudioElement | null = null;

// iOS mutes Web Audio when the ring/silent switch is on, because it runs in
// the "ambient" audio session. Playing any looping <audio> element promotes
// the session to "playback", which ignores the switch — the standard
// workaround used by web games. Only needed (and only run) on iOS.
const isIOS = (): boolean =>
	typeof navigator !== 'undefined' &&
	(/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		// iPadOS reports as desktop Safari but has touch support
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

// Half a second of silence, built by hand (8kHz 8-bit mono PCM, ~4KB).
// iOS ignores looping media that is effectively zero-length, so the file
// needs real duration to hold the session in "playback".
const createSilentWavUrl = (): string => {
	const sampleRate = 8000;
	const numSamples = sampleRate / 2;
	const buffer = new ArrayBuffer(44 + numSamples);
	const view = new DataView(buffer);
	const writeString = (offset: number, text: string) => {
		for (let i = 0; i < text.length; i++) {
			view.setUint8(offset + i, text.charCodeAt(i));
		}
	};
	writeString(0, 'RIFF');
	view.setUint32(4, 36 + numSamples, true);
	writeString(8, 'WAVE');
	writeString(12, 'fmt ');
	view.setUint32(16, 16, true); // fmt chunk size
	view.setUint16(20, 1, true); // PCM
	view.setUint16(22, 1, true); // mono
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate, true); // byte rate
	view.setUint16(32, 1, true); // block align
	view.setUint16(34, 8, true); // bits per sample
	writeString(36, 'data');
	view.setUint32(40, numSamples, true);
	// 8-bit PCM silence sits at the unsigned midpoint
	new Uint8Array(buffer, 44).fill(128);
	return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
};

const engagePlaybackSession = (): void => {
	if (!isIOS()) return;
	if (!unmuteElement) {
		unmuteElement = new Audio(createSilentWavUrl());
		unmuteElement.loop = true;
		unmuteElement.preload = 'auto';
	}
	// Rejection just means we stay in ambient mode — no worse than before
	unmuteElement.play().catch(() => {});
};

export const initAudio = async (): Promise<void> => {
	// Runs inside the click's gesture context, which iOS requires
	engagePlaybackSession();

	await Tone.start();

	// iOS can leave the context "interrupted" after a phone call or
	// backgrounding, and Tone.start() alone doesn't always recover it
	const rawContext = Tone.getContext().rawContext;
	if (rawContext.state !== 'running') {
		await rawContext.resume();
	}

	if (!synth) {
		synth = new Tone.Synth({
			oscillator: {
				type: 'sine'
			},
			envelope: {
				attack: 0.005,
				decay: 0.1,
				sustain: 0.3,
				release: 1
			}
		}).toDestination();
	}
};

const NOTE_SECONDS = 0.45;

export interface PlaybackHandle {
	cancel: () => void;
	totalSeconds: number;
}

// Play a row form and tick a highlight callback per note (null = finished).
// Audio is scheduled precisely on the Tone clock; the UI ticks use matching
// setTimeouts — drift over a 5-second sequence is imperceptible for a
// highlight. (Tone.getDraw().schedule() is the upgrade path if it ever isn't.)
// Safe to call from a click handler only, since it initializes audio.
export const playRowForm = async (
	pitches: string[],
	onNote: (index: number | null) => void
): Promise<PlaybackHandle> => {
	await initAudio();

	const start = Tone.now() + 0.05;
	for (let i = 0; i < pitches.length; i++) {
		// Shortened slightly so the monophonic synth articulates each note
		synth?.triggerAttackRelease(pitches[i], NOTE_SECONDS - 0.06, start + i * NOTE_SECONDS);
	}

	const timers: ReturnType<typeof setTimeout>[] = [];
	for (let i = 0; i < pitches.length; i++) {
		timers.push(setTimeout(() => onNote(i), 50 + i * NOTE_SECONDS * 1000));
	}
	const totalSeconds = pitches.length * NOTE_SECONDS;
	timers.push(setTimeout(() => onNote(null), 50 + totalSeconds * 1000));

	const cancel = () => {
		timers.forEach(clearTimeout);
		// A plain Synth can't un-schedule triggerAttackRelease events, so
		// disposing is the reliable way to silence what's pending; the next
		// play lazily recreates it.
		synth?.dispose();
		synth = null;
		onNote(null);
	};

	return { cancel, totalSeconds };
};
