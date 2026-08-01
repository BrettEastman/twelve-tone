# Twelve-Tone Matrix

A single-page web app for working with twelve-tone rows. Enter a row by clicking notes onto a
staff, and the app builds the traditional 12x12 matrix and lets you view and hear any of the
48 row forms in notation.

## Features

- **Staff input** — click directly on a VexFlow-rendered staff to place notes; treble or bass
  clef, sharp/flat/natural accidental modes, erase mode, and clear all.
- **Duplicate protection** — a pitch class already in the row is rejected with a message naming
  where it appears, and the corresponding chip flashes.
- **Progress chips** — all twelve pitch classes in chromatic order, showing which are used and
  their position in the row, plus an `n / 12` counter.
- **Matrix** — once twelve notes are entered, the full matrix appears with clickable P, I, R,
  and RI labels on all four edges and crosshair hover highlighting.
- **Row form panel** — the selected form is rendered on a staff with its note names and a
  play/stop button; the currently sounding note is highlighted as playback advances.
- **Consistent spelling** — a complete row defines a pitch class → spelling map, so every
  derived form reuses the exact spellings the user entered. `P` at the original transposition
  keeps the user's octaves; other forms use a fixed octave per clef.

## Stack

- **SvelteKit 2 + Svelte 5** (runes: `$state`, `$derived`, `$props`, `$effect`), TypeScript
- **VexFlow 5** for notation rendering
- **Tone.js** for playback (single sine `Tone.Synth`, includes an iOS silent-switch workaround)
- **Cloudflare Workers** via `@sveltejs/adapter-cloudflare` and `wrangler`
- Hand-written CSS with design tokens; no UI framework

## Project structure

```
src/
  routes/
    +layout.svelte              app shell, title, tagline, global styles
    +page.svelte                composes staff input, matrix, and form panel
  lib/
    theory.ts                   pure pitch-class math: mod12, invert, buildMatrix, rowForm
    spelling.ts                 pc <-> letter/accidental, VexFlow keys, Tone pitch strings
    rowState.svelte.ts          shared $state store + mutation helpers
    audio.ts                    Tone.js init and scheduled row playback
    components/
      StaffInput.svelte          click-to-place note entry with toolbar
      PitchClassProgress.svelte  twelve pitch-class chips and counter
      MatrixGrid.svelte          12x12 table with clickable edge labels
      RowFormPanel.svelte        selected form: notation, note names, playback
      RowNotation.svelte         reusable staff renderer with highlight support
  styles/
    tokens.css, base.css
```

## Development

Requires Node (managed via nvm) and pnpm.

```sh
pnpm install
pnpm dev            # dev server
pnpm dev --open     # dev server and open a browser tab
pnpm check          # svelte-check type/diagnostics pass
```

## Build and deploy

```sh
pnpm build          # outputs a Cloudflare Worker bundle to .svelte-kit/cloudflare
pnpm preview        # preview the production build locally
```

Deployment targets Cloudflare Workers; see `wrangler.jsonc` for the worker name and asset
binding.
