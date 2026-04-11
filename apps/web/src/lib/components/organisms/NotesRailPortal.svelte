<script lang="ts">
  import { getContext } from 'svelte'
  import type { Snippet } from 'svelte'

  let { content }: { content: Snippet } = $props()

  const ctx = getContext<{ setRightRail: (s: Snippet | undefined) => void }>('notesLayout')

  $effect(() => {
    ctx.setRightRail(content)
    return () => ctx.setRightRail(undefined)
  })
</script>
