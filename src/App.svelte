<script>
  import { onMount } from 'svelte';
  import Home from './lib/Home.svelte';
  import Timeline from './lib/Timeline.svelte';

  let currentPath = '/';

  onMount(() => {
    currentPath = window.location.pathname;
    
    window.addEventListener('popstate', () => {
      currentPath = window.location.pathname;
    });
  });

  function navigate(path) {
    window.history.pushState({}, '', path);
    currentPath = path;
  }

  $: if (typeof window !== 'undefined') {
    window.navigate = navigate;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap" rel="stylesheet">
</svelte:head>

{#if currentPath === '/timeline'}
  <Timeline />
{:else}
  <Home />
{/if}
