<script lang="ts">
  import { base } from '$app/paths'
  import { HeroSection, RecentNotes, SectionHeader, SurfaceCard, Badge, getNotes, getProjectDetails } from '$lib'

  const notes = getNotes().slice(0, 4)
  const projects = getProjectDetails().slice(0, 3)

  function withBase(path: string): string {
    return `${base}${path}`
  }
</script>

<svelte:head>
  <title>sunshinemoon</title>
</svelte:head>

<HeroSection />
<section class="reveal border-t border-border py-14">
  <SectionHeader title="Projects" href={withBase('/projects')} actionLabel="View all →" />

  <div class="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
    {#each projects as project}
      <SurfaceCard
        href={withBase(`/projects/${project.slug}`)}
        class="flex flex-col p-5 min-h-[200px] no-underline hover:shadow-[0_0_30px_rgba(245,158,11,0.08)] hover:border-gold/40 group"
      >
        <h3 class="text-[0.95rem] font-semibold text-text mb-1.5 group-hover:text-gold transition-colors">{project.name}</h3>
        <p class="text-xs text-muted leading-relaxed mb-3 flex-1">{project.description}</p>
        <div class="flex flex-wrap gap-1">
          {#each project.techs.slice(0, 3) as tech}
            <Badge>{tech}</Badge>
          {/each}
        </div>
        <span class="mt-3 text-xs text-text-dark group-hover:text-gold transition-colors">View details →</span>
      </SurfaceCard>
    {/each}
  </div>
</section>
<RecentNotes {notes} />
