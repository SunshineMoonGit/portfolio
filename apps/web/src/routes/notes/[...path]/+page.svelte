<script lang="ts">
  import { NotesListView } from '$lib'
  import type { PageData } from './$types'

  let { data }: { data: PageData } = $props()
</script>

<NotesListView selectedPath={data.selectedPath} />
