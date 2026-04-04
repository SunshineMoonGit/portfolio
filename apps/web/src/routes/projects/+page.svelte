<script lang="ts">
  import { Badge, SectionHeader, SurfaceCard, getProjectDetails } from '$lib'

  const projects = getProjectDetails()
</script>

<svelte:head>
  <title>Projects · sunshinemoon</title>
</svelte:head>

<div class="pt-14 pb-10">
  <SectionHeader title="Projects" meta={`${projects.length}개`} />
</div>

{#if projects.length}
  <div class="grid gap-4">
    {#each projects as project}
      <SurfaceCard href={`/projects/${project.slug}`} class="p-6 group hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]">
        <h2 class="text-lg font-semibold text-text mb-2 group-hover:text-gold">{project.name}</h2>
        <p class="text-sm text-muted leading-relaxed mb-4">{project.description}</p>
        <div class="flex flex-wrap gap-1.5 mb-4">
          {#each project.techs as tech}
            <Badge>{tech}</Badge>
          {/each}
        </div>
        <span class="text-xs text-text-dark group-hover:text-gold transition-colors">View details →</span>
      </SurfaceCard>
    {/each}
  </div>
{:else}
  <p class="text-subtle text-sm py-8">프로젝트가 없습니다.</p>
{/if}
