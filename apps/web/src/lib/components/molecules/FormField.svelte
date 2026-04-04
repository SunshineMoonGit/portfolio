<script lang="ts">
  let {
    children,
    label,
    forId
  }: {
    children?: import('svelte').Snippet
    label: string
    forId: string
  } = $props()
</script>

<div>
  <label for={forId} class="block text-xs text-muted mb-1">{label}</label>
  {@render children?.()}
</div>
