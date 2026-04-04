<script lang="ts">
  let {
    value = $bindable(),
    id,
    rows = 6,
    class: className = ''
  }: {
    value?: string
    id?: string
    rows?: number
    class?: string
  } = $props()
</script>

<textarea
  bind:value
  {id}
  {rows}
  class={`w-full px-4 py-3 bg-dark border border-border rounded-lg text-sm text-text leading-relaxed focus:outline-none focus:border-gold resize-y ${className}`.trim()}
></textarea>
