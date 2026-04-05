<script lang="ts">
  import { onMount } from 'svelte'
  import { Badge, SectionHeader, SurfaceCard } from '$lib'
  import { withBase } from '$lib/utils'
  import { toProjectSlug } from '$lib/project-slug'

  type Project = {
    slug?: string
    name: string
    description: string
    url: string
    techs: string[]
  }

  let { projects }: { projects: Project[] } = $props()
  let projectCards: HTMLElement[] = []

  onMount(() => {
    function handleCardMouse(event: MouseEvent) {
      const card = event.currentTarget as HTMLElement
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-2px)`
    }

    function handleCardLeave(event: MouseEvent) {
      const card = event.currentTarget as HTMLElement
      card.style.transform = ''
    }

    projectCards.forEach((card) => {
      card?.addEventListener('mousemove', handleCardMouse)
      card?.addEventListener('mouseleave', handleCardLeave)
    })

    return () => {
      projectCards.forEach((card) => {
        card?.removeEventListener('mousemove', handleCardMouse)
        card?.removeEventListener('mouseleave', handleCardLeave)
      })
    }
  })
</script>

<section class="reveal border-t border-border py-14">
  <SectionHeader title="Projects" href={withBase('/projects')} actionLabel="View all →" />

  <div class="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
    {#each projects.slice(0, 3) as project, index}
      <div class="reveal-child" style="--delay: {index * 0.1}s" bind:this={projectCards[index]}>
        <SurfaceCard
          href={withBase(`/projects/${project.slug ?? toProjectSlug(project.name)}`)}
          class="tilt-card flex flex-col p-5 min-h-[200px] no-underline hover:shadow-[0_0_30px_rgba(245,158,11,0.08)] hover:border-gold/40 group"
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
      </div>
    {/each}
  </div>
</section>

<style>
  :global(.tilt-card) {
    transition: transform 0.15s ease-out, border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    will-change: transform;
  }
</style>
