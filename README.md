# Twelve-Tone Matrix

A single-page web app for working with twelve-tone rows. Enter a row by clicking notes onto a
staff, and the app builds the traditional 12x12 matrix and lets you view and hear any of the
48 row forms in notation.

## Features

- **Staff input** — click directly on a VexFlow-rendered staff to place notes; treble or bass
  clef, sharp/flat/natural accidental modes, erase mode, and clear all.
- **Variable row length** — rows can be 3 to 17 notes long, selectable from the toolbar. At 12
  or fewer, the classic no-repeated-pitch-class rule applies; above 12, pitch classes may repeat
  (unavoidable past 12 by the pigeonhole principle). Shortening the length trims any extra
  trailing notes.
- **Duplicate protection** — a pitch class already in the row is rejected with a message naming
  where it appears (only enforced at length ≤ 12), and the corresponding chip flashes.
- **Progress chips** — all twelve pitch classes in chromatic order, showing which are used, their
  position in the row (a ×N badge if repeated), and an `n / rowLength` counter.
- **Matrix** — once the row is complete, the full matrix appears with clickable P, I, R, and RI
  labels on all four edges and crosshair hover highlighting. Row/column highlighting is matched
  by label value rather than index, since repeated pitch classes can put the same label on
  multiple rows/columns.
- **Row form panel** — the selected form is rendered on a staff with its note names and a
  play/stop button; the currently sounding note is highlighted as playback advances.
- **Consistent spelling** — the user's entered notes define a pitch class → spelling map (first
  entry wins for a repeated pc). Rows shorter than 12 notes produce transposed forms containing
  pcs the user never entered; those gaps are filled with defaults that follow the user's own
  sharp/flat tendency. `P` at the original transposition keeps the user's exact octaves; other
  forms use a fixed octave per clef.

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
      StaffInput.svelte          click-to-place note entry with toolbar (incl. row length)
      PitchClassProgress.svelte  twelve pitch-class chips, repeat badges, and counter
      MatrixGrid.svelte          NxN matrix table with clickable edge labels
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
