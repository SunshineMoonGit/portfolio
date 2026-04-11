<script lang="ts">
  import { setContext } from 'svelte'
  import type { Snippet } from 'svelte'
  import { page } from '$app/state'
  import { NotesShell } from '$lib'

  let { children } = $props()

  let rightRail = $state<Snippet | undefined>(undefined)

  setContext('notesLayout', {
    setRightRail(s: Snippet | undefined) {
      rightRail = s
    }
  })

  let selectedPath = $derived((page.data.selectedPath as string | null) ?? null)
</script>

<NotesShell {selectedPath} {rightRail}>
  {@render children()}
</NotesShell>
