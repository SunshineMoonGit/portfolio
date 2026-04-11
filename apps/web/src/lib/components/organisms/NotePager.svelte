<script lang="ts">
  import { withBase } from '$lib/utils'

  type AdjacentNote = {
    slug: string
    title: string
  }

  let {
    prev,
    next
  }: {
    prev?: AdjacentNote
    next?: AdjacentNote
  } = $props()
</script>

{#if prev || next}
  <nav class="border-t border-border/50 pt-7" aria-label="Note pager">
    <div class="grid gap-6 sm:grid-cols-2">
      {#if prev}
        <a
          href={withBase(`/note/${prev.slug}`)}
          class="group flex min-w-0 flex-col gap-2"
          rel="prev"
        >
          <span class="flex items-center gap-1.5 text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-subtle transition-colors group-hover:text-text-dim">
            <span aria-hidden="true">←</span> Previous
          </span>
          <span class="text-[0.9rem] leading-snug text-text-dim transition-colors group-hover:text-text-bright">
            {prev.title}
          </span>
        </a>
      {/if}

      {#if next}
        <a
          href={withBase(`/note/${next.slug}`)}
          class="group flex min-w-0 flex-col gap-2 text-left sm:text-right {prev ? '' : 'sm:col-start-2'}"
          rel="next"
        >
          <span class="flex items-center gap-1.5 text-[0.63rem] font-semibold uppercase tracking-[0.22em] text-subtle transition-colors group-hover:text-text-dim sm:justify-end">
            Next <span aria-hidden="true">→</span>
          </span>
          <span class="text-[0.9rem] leading-snug text-text-dim transition-colors group-hover:text-text-bright">
            {next.title}
          </span>
        </a>
      {/if}
    </div>
  </nav>
{/if}
