<script lang="ts">
  import { base } from '$app/paths'
  import { Badge, SectionHeader, getProjectDetails } from '$lib'

  const projects = getProjectDetails()

  function withBase(path: string): string {
    return `${base}${path}`
  }
</script>

<svelte:head>
  <title>Projects · sunshinemoon</title>
</svelte:head>

<div class="pt-14 pb-10">
  <SectionHeader title="Projects" meta={`${projects.length}개`} />
</div>

{#if projects.length}
  <div class="grid grid-cols-3 gap-5 max-sm:grid-cols-1">
    {#each projects as project}
      <a href={withBase(`/projects/${project.slug}`)} class="project-card group block rounded-2xl border border-border bg-dark-card overflow-hidden hover:border-border-hover transition-all">
        {#if project.image}
          <div class="aspect-[16/9] overflow-hidden bg-dark">
            <img
              src={project.image}
              alt={project.name}
              class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
        {/if}
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-semibold text-text group-hover:text-gold transition-colors">{project.name}</h2>
            {#if project.period}
              <span class="text-xs text-subtle shrink-0 ml-4">{project.period}</span>
            {/if}
          </div>
          <p class="text-sm text-muted leading-relaxed mb-4">{project.description}</p>
          <div class="flex flex-wrap gap-1.5">
            {#each project.techs as tech}
              <Badge>{tech}</Badge>
            {/each}
          </div>
        </div>
      </a>
    {/each}
  </div>
{:else}
  <p class="text-subtle text-sm py-8">프로젝트가 없습니다.</p>
{/if}

<style>
  .project-card {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .project-card:hover {
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25), 0 0 40px rgba(215, 164, 73, 0.06);
  }
</style>
