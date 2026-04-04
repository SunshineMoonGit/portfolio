<script lang="ts">
  let {
    value = $bindable(),
    id,
    type = 'text',
    placeholder,
    disabled = false,
    class: className = ''
  }: {
    value?: string
    id?: string
    type?: 'text' | 'date'
    placeholder?: string
    disabled?: boolean
    class?: string
  } = $props()
</script>

<input
  bind:value
  {id}
  {type}
  {placeholder}
  {disabled}
  class={`w-full px-4 py-2.5 bg-dark border border-border rounded-lg text-sm text-text placeholder:text-subtle focus:outline-none focus:border-gold disabled:opacity-50 ${className}`.trim()}
/>
