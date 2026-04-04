<script lang="ts">
  let {
    children,
    href,
    variant = 'ghost',
    size = 'sm',
    disabled = false,
    type = 'button',
    target,
    rel,
    class: className = '',
    onclick
  }: {
    children?: import('svelte').Snippet
    href?: string
    variant?: 'primary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    disabled?: boolean
    type?: 'button' | 'submit'
    target?: string
    rel?: string
    class?: string
    onclick?: (event: MouseEvent) => void
  } = $props()

  const variantClasses = {
    primary: 'bg-gold text-dark hover:bg-gold-light border-gold',
    ghost: 'border-border text-muted hover:text-text hover:border-border-hover bg-transparent',
    danger: 'border-border text-muted hover:text-red-400 hover:border-red-400/30 bg-transparent'
  }

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg',
    md: 'text-sm px-5 py-2.5 rounded-lg'
  }

  const classes = $derived(`inline-flex items-center justify-center border font-medium transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'} ${className}`.trim())
</script>

{#if href}
  <a {href} {target} {rel} class={classes}>
    {@render children?.()}
  </a>
{:else}
  <button {type} {disabled} class={classes} {onclick}>
    {@render children?.()}
  </button>
{/if}
