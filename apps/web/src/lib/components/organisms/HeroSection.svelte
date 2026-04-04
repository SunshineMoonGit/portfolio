<script lang="ts">
  import { base } from '$app/paths'
  import { onMount } from 'svelte'

  let heroEl: HTMLElement
  let moon: HTMLElement
  let moonText: HTMLElement
  let starCanvas: HTMLCanvasElement
  let cursorGlow: HTMLElement
  let mouseX = 0
  let mouseY = 0

  function withBase(path: string): string {
    return `${base}${path}`
  }

  onMount(() => {
    const handleMouse = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY

      const x = (event.clientX / window.innerWidth - 0.5) * 8
      const y = (event.clientY / window.innerHeight - 0.5) * 6
      moon.style.transform = `translate(${x}px, ${y}px)`

      const heroRect = heroEl.getBoundingClientRect()
      if (event.clientY < heroRect.bottom) {
        cursorGlow.style.opacity = '1'
        cursorGlow.style.left = `${event.clientX - heroRect.left}px`
        cursorGlow.style.top = `${event.clientY - heroRect.top}px`
      } else {
        cursorGlow.style.opacity = '0'
      }
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = heroEl.clientHeight

      if (scrollY < heroHeight) {
        const ratio = scrollY / heroHeight
        moon.style.marginTop = `${scrollY * 0.3}px`
        moonText.style.transform = `translateY(${scrollY * 0.15}px)`
        heroEl.style.setProperty('--scroll-opacity', String(1 - ratio * 1.2))
      }
    }

    const context = starCanvas.getContext('2d')
    if (!context) return
    const ctx = context as CanvasRenderingContext2D

    type Star = { x: number; y: number; r: number; baseR: number; speed: number; opacity: number; baseOpacity: number; phase: number }
    const stars: Star[] = []

    function resizeCanvas() {
      const hero = starCanvas.parentElement
      if (!hero) return
      starCanvas.width = hero.clientWidth
      starCanvas.height = hero.clientHeight
    }

    function draw() {
      ctx.clearRect(0, 0, starCanvas.width, starCanvas.height)
      time += 0.008

      const heroRect = heroEl.getBoundingClientRect()
      const mx = mouseX - heroRect.left
      const my = mouseY - heroRect.top

      for (const star of stars) {
        const dx = star.x - mx
        const dy = star.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - dist / 200)

        star.r = star.baseR + proximity * 1.5
        star.opacity = star.baseOpacity + proximity * 0.5

        const twinkle = Math.sin(time * star.speed * 10 + star.phase) * 0.3 + 0.7
        const y = star.y + Math.sin(time * 0.8 + star.phase) * 0.8

        ctx.beginPath()
        ctx.arc(star.x, y, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
        ctx.fill()

        if (proximity > 0.3) {
          ctx.beginPath()
          ctx.arc(star.x, y, star.r * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(200, 220, 255, ${proximity * 0.1})`
          ctx.fill()
        }
      }

      frame = requestAnimationFrame(draw)
    }

    resizeCanvas()
    for (let index = 0; index < 100; index += 1) {
      const r = Math.random() * 1.2 + 0.3
      const opacity = Math.random() * 0.6 + 0.2
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r,
        baseR: r,
        speed: Math.random() * 0.15 + 0.02,
        opacity,
        baseOpacity: opacity,
        phase: Math.random() * Math.PI * 2
      })
    }

    let frame = 0
    let time = 0

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', resizeCanvas)
    draw()

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(frame)
    }
  })
</script>

<section class="hero" bind:this={heroEl} style="--scroll-opacity: 1">
  <canvas class="absolute inset-0 pointer-events-none" bind:this={starCanvas}></canvas>

  <div
    class="absolute w-[300px] h-[300px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300"
    style="background: radial-gradient(circle, rgba(180, 200, 230, 0.06) 0%, transparent 70%)"
    bind:this={cursorGlow}
  ></div>

  <div class="relative mb-8 transition-transform duration-600 ease-out animate-[moonFloat_12s_ease-in-out_infinite]" bind:this={moon}>
    <img src={withBase('/moon.webp')} alt="Moon" class="block w-[clamp(140px,20vw,240px)] h-auto drop-shadow-[0_0_60px_rgba(180,200,220,0.5)]" />
    <div class="absolute -inset-1/2 rounded-full bg-[radial-gradient(circle,rgba(180,200,230,0.18)_0%,rgba(180,200,230,0.05)_40%,transparent_65%)] -z-1 pointer-events-none"></div>
  </div>

  <div class="flex flex-col items-center" style="opacity: var(--scroll-opacity)" bind:this={moonText}>
    <p class="hello-type text-[clamp(1rem,2.5vw,1.3rem)] text-muted mb-2 font-normal tracking-wide">Hello,</p>
    <h1 class="text-[clamp(3rem,9vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.04em]">
      <span class="sunshine-text bg-gradient-to-br from-gold via-gold-light to-gold bg-clip-text text-transparent">Sunshine</span><br />
      <span class="moon-name text-text">Moon</span>
    </h1>
    <p class="headline-text text-[clamp(0.8rem,1.8vw,1rem)] text-subtle mt-5 font-light tracking-wide">Backend Developer · Security & Infrastructure</p>
  </div>

  <div class="absolute bottom-[5vh] animate-[bounce_2s_ease-in-out_infinite]" style="opacity: var(--scroll-opacity)">
    <span class="block w-5 h-5 border-r-2 border-b-2 border-subtle rotate-45"></span>
  </div>
</section>

<style>
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 100vh;
    margin: -4rem calc(-50vw + 50%) 0;
    padding: 6rem 1.5rem 4rem;
    background:
      radial-gradient(ellipse 78% 52% at 50% 28%, #24324f 0%, #1b222c 54%, #161a1f 100%);
    overflow: hidden;
  }

  .hello-type {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 0.2s forwards;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .sunshine-text {
    opacity: 0;
    display: inline-block;
    animation: slideInLeft 0.7s ease-out 0.5s forwards;
    filter: drop-shadow(0 10px 24px rgba(215, 164, 73, 0.22));
  }

  .moon-name {
    opacity: 0;
    display: inline-block;
    animation: slideInRight 0.7s ease-out 0.7s forwards;
    text-shadow: 0 12px 30px rgba(0, 0, 0, 0.24);
  }

  .headline-text {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 1s forwards;
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes moonFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
