<script lang="ts">
  import NotesCategoryRail from './NotesCategoryRail.svelte'

  let {
    selectedPath = null,
    rightRail,
    children
  }: {
    selectedPath?: string | null
    rightRail?: import('svelte').Snippet
    children?: import('svelte').Snippet
  } = $props()
</script>

<div
  class="grid gap-8 pt-8 lg:grid-cols-[220px_minmax(0,840px)_220px] lg:items-start lg:justify-center lg:gap-x-8 lg:pt-10"
>
  <aside class="order-1 lg:col-start-1 lg:row-start-1 lg:self-stretch lg:pt-7">
    <div class="lg:sticky lg:top-20">
      <NotesCategoryRail {selectedPath} />
    </div>
  </aside>

  <main class="order-2 min-w-0 lg:col-start-2 lg:row-start-1">
    {@render children?.()}
  </main>

  <aside class="order-3 hidden lg:block lg:col-start-3 lg:row-start-1 lg:self-stretch lg:pt-7">
    <div class="lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-1">
      {@render rightRail?.()}
    </div>
  </aside>
</div>
