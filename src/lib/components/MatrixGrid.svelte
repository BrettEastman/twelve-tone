<script lang="ts">
  import { rowState, selectForm } from "$lib/rowState.svelte";
  import { prettyPc, type Spelling } from "$lib/spelling";
  import { matrixLabels, type FormId, type PitchClass } from "$lib/theory";

  interface Props {
    matrix: PitchClass[][];
    spellingMap: Map<PitchClass, Spelling>;
  }

  let { matrix, spellingMap }: Props = $props();

  const labels = $derived(matrixLabels(matrix));

  let hover: { i: number; j: number } | null = $state(null);

  const isSelected = (form: FormId): boolean =>
    rowState.selectedForm?.kind === form.kind &&
    rowState.selectedForm?.n === form.n;

  // The selected form highlights its whole row (P/R) or column (I/RI).
  // Compared by label value, not index: rows longer than 12 repeat pitch
  // classes, so the same label can appear on several rows/columns.
  const isSelectedRow = (i: number): boolean =>
    rowState.selectedForm !== null &&
    (rowState.selectedForm.kind === "P" ||
      rowState.selectedForm.kind === "R") &&
    labels.p[i] === rowState.selectedForm.n;
  const isSelectedCol = (j: number): boolean =>
    rowState.selectedForm !== null &&
    (rowState.selectedForm.kind === "I" ||
      rowState.selectedForm.kind === "RI") &&
    labels.i[j] === rowState.selectedForm.n;
</script>

<div class="matrix-wrapper">
  <table onmouseleave={() => (hover = null)}>
    <thead>
      <tr>
        <td class="corner"></td>
        {#each labels.i as n, j (j)}
          <th scope="col" class:crosshair={hover?.j === j}>
            <button
              type="button"
              class:selected={isSelected({ kind: "I", n })}
              onclick={() => selectForm({ kind: "I", n })}
            >
              I<sub>{n}</sub>
            </button>
          </th>
        {/each}
        <td class="corner"></td>
      </tr>
    </thead>
    <tbody>
      {#each matrix as row, i (i)}
        <tr>
          <th scope="row" class:crosshair={hover?.i === i}>
            <button
              type="button"
              class:selected={isSelected({ kind: "P", n: labels.p[i] })}
              onclick={() => selectForm({ kind: "P", n: labels.p[i] })}
            >
              P<sub>{labels.p[i]}</sub>
            </button>
          </th>
          {#each row as pc, j (j)}
            <td
              class="cell"
              class:crosshair={hover?.i === i || hover?.j === j}
              class:in-selection={isSelectedRow(i) || isSelectedCol(j)}
              onmouseenter={() => (hover = { i, j })}
            >
              {prettyPc(pc, spellingMap)}
            </td>
          {/each}
          <th scope="row" class="right" class:crosshair={hover?.i === i}>
            <button
              type="button"
              class:selected={isSelected({ kind: "R", n: labels.p[i] })}
              onclick={() => selectForm({ kind: "R", n: labels.p[i] })}
            >
              R<sub>{labels.p[i]}</sub>
            </button>
          </th>
        </tr>
      {/each}
    </tbody>
    <tfoot>
      <tr>
        <td class="corner"></td>
        {#each labels.i as n, j (j)}
          <th scope="col" class:crosshair={hover?.j === j}>
            <button
              type="button"
              class:selected={isSelected({ kind: "RI", n })}
              onclick={() => selectForm({ kind: "RI", n })}
            >
              RI<sub>{n}</sub>
            </button>
          </th>
        {/each}
        <td class="corner"></td>
      </tr>
    </tfoot>
  </table>
</div>

<style>
  .matrix-wrapper {
    overflow-x: auto;
  }

  table {
    border-collapse: collapse;
    margin: 0 auto;
    font-variant-numeric: tabular-nums;
  }

  .cell {
    width: 3.4ch;
    min-width: 3.4ch;
    text-align: center;
    padding: 0.35rem 0.45rem;
    border: 1px solid var(--color-border-soft);
    font-size: var(--text-sm);
    background: #ffffff;
    transition: background-color 0.1s ease;
  }

  .cell.crosshair {
    background: var(--color-paper-soft);
  }

  .cell.in-selection {
    background: color-mix(in srgb, var(--color-accent-soft) 35%, white);
  }

  th {
    padding: 0.15rem;
    border: none;
  }

  th.crosshair button {
    border-color: var(--color-accent-soft);
    color: var(--color-accent);
  }

  th button {
    width: 100%;
    min-width: 3.2rem;
    padding: 0.3rem 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-muted);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  th button:hover {
    background: var(--color-paper-soft);
    color: var(--color-accent);
  }

  th button.selected {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: #fff;
  }

  sub {
    font-size: 0.7em;
  }

  .corner {
    border: none;
  }
</style>
