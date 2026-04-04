<script lang="ts">
  import { Badge } from '$lib'

  let {
    category,
    date
  }: {
    category: string
    date: string
  } = $props()
</script>

<div class="flex gap-3 text-xs">
  <Badge tone="gold" uppercase>{category}</Badge>
  <time class="text-subtle">{date}</time>
</div>
