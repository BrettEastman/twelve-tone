<script lang="ts">
  import "../styles/tokens.css";
  import "../styles/base.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Tone Row Generator</title>
</svelte:head>

<div class="shell">
  <header class="site-header">
    <h1>TONE ROW GENERATOR</h1>
    <p class="tagline">
      Enter a tone row on the staff, then explore its matrix, including all
      transformations (prime, inversion, retrograde, and retrograde inversion),
      in notation and sound. Tone rows can be any length from 3-17.
    </p>
  </header>

  <main>
    {@render children()}
  </main>

  <footer class="site-footer">
    <p>After the method of Arnold Schoenberg</p>
  </footer>
</div>

<style>
  .shell {
    max-width: 64rem;
    margin: 0 auto;
    padding: var(--space-5) var(--space-4) var(--space-7);
  }

  .site-header {
    text-align: center;
    margin-bottom: var(--space-6);
  }

  .site-header h1 {
    font-size: 2.2rem;
    margin: 0 0 var(--space-2);
  }

  .tagline {
    color: var(--color-muted);
    font-size: var(--text-md);
    max-width: 38rem;
    margin: 0 auto;
  }

  .site-footer {
    margin-top: var(--space-7);
    text-align: center;
    color: var(--color-muted);
    font-size: var(--text-sm);
    font-style: italic;
  }
</style>
