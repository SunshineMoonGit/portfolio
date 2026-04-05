<script lang="ts">
  import { Badge } from '$lib'

  let {
    category,
    created
  }: {
    category: string
    created: string
  } = $props()
</script>

<div class="flex gap-3 text-xs">
  <Badge tone="gold" uppercase>{category}</Badge>
  <time class="text-subtle">{created}</time>
</div>
