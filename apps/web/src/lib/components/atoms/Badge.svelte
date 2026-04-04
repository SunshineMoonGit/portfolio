<script lang="ts">
  let {
    children,
    tone = 'muted',
    uppercase = false,
    class: className = ''
  }: {
    children?: import('svelte').Snippet
    tone?: 'muted' | 'gold'
    uppercase?: boolean
    class?: string
  } = $props()

  const toneClasses = {
    muted: 'text-text-dim bg-border',
    gold: 'text-gold bg-gold/10 border border-gold/20'
  }
</script>

<span class={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${uppercase ? 'uppercase tracking-wider' : ''} ${toneClasses[tone]} ${className}`.trim()}>
  {@render children?.()}
</span>
