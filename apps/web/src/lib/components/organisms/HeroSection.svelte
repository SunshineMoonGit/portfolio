<script lang="ts">
  import { onMount } from 'svelte'
  import { site } from '$lib/config'
  import { withBase } from '$lib/utils'

  let heroEl: HTMLElement
  let moon: HTMLElement
  let moonText: HTMLElement
  let starCanvas: HTMLCanvasElement
  let cursorGlow: HTMLElement
  let mouseX = 0
  let mouseY = 0

  onMount(() => {
    const handleMouse = (event: MouseEvent) => {
      mouseX = event.clientX
      mouseY = event.clientY

      // Moon parallax
      const nx = event.clientX / window.innerWidth - 0.5
      const ny = event.clientY / window.innerHeight - 0.5
      moon.style.transform = `translate(${nx * 25}px, ${ny * 20}px)`

      const heroRect = heroEl.getBoundingClientRect()
      if (event.clientY < heroRect.bottom) {
        cursorGlow.style.opacity = '1'
        cursorGlow.style.left = `${event.clientX - heroRect.left}px`
        cursorGlow.style.top = `${event.clientY - heroRect.top}px`
      } else {
        cursorGlow.style.opacity = '0'
      }
    }

    const handleClick = (event: MouseEvent) => {
      const heroRect = heroEl.getBoundingClientRect()
      if (event.clientY > heroRect.bottom) return
      const cx = event.clientX - heroRect.left
      const cy = event.clientY - heroRect.top
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3.5 + 1.5
        clickParticles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          r: Math.random() * 2.5 + 0.8
        })
      }
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = heroEl.clientHeight
      if (scrollY < heroHeight) {
        const ratio = scrollY / heroHeight
        moonText.style.transform = `translateY(${scrollY * 0.15}px)`
        heroEl.style.setProperty('--scroll-opacity', String(1 - ratio * 1.2))
      }
    }

    const context = starCanvas.getContext('2d')
    if (!context) return
    const ctx = context as CanvasRenderingContext2D

    // === Types ===
    type Star = {
      x: number; y: number; r: number; baseR: number
      speed: number; opacity: number; baseOpacity: number; phase: number
      layer: number // 0 = far, 1 = mid, 2 = near
    }
    type ShootingStar = {
      x: number; y: number; vx: number; vy: number
      life: number; length: number; opacity: number
    }
    type ClickParticle = {
      x: number; y: number; vx: number; vy: number
      life: number; r: number
    }
    type TrailPoint = { x: number; y: number; age: number }
    type Nebula = {
      x: number; y: number; rx: number; ry: number
      r: number; g: number; b: number; alpha: number
      speedX: number; speedY: number; phase: number
    }

    const stars: Star[] = []
    const shootingStars: ShootingStar[] = []
    const clickParticles: ClickParticle[] = []
    const trail: TrailPoint[] = []
    const nebulae: Nebula[] = []
    let nextShootingStarTime = Math.random() * 180 + 80

    // Parallax multipliers per layer: far=slow, near=fast
    const layerParallax = [0.01, 0.03, 0.06]

    function resizeCanvas() {
      const hero = starCanvas.parentElement
      if (!hero) return
      starCanvas.width = hero.clientWidth
      starCanvas.height = hero.clientHeight
    }

    function spawnShootingStar() {
      const startX = Math.random() * starCanvas.width * 0.8
      const startY = Math.random() * starCanvas.height * 0.3
      const angle = Math.PI / 6 + Math.random() * Math.PI / 6
      const speed = 6 + Math.random() * 5
      shootingStars.push({
        x: startX, y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        length: 60 + Math.random() * 50,
        opacity: 0.7 + Math.random() * 0.3
      })
    }

    function draw() {
      ctx.clearRect(0, 0, starCanvas.width, starCanvas.height)
      time += 0.006

      const heroRect = heroEl.getBoundingClientRect()
      const mx = mouseX - heroRect.left
      const my = mouseY - heroRect.top
      const nx = (mouseX / window.innerWidth - 0.5)
      const ny = (mouseY / window.innerHeight - 0.5)

      // === Nebulae (background layer) ===
      for (const n of nebulae) {
        const drift = Math.sin(time * 0.5 + n.phase) * 20
        const cx = n.x + n.speedX * time * 60 + drift
        const cy = n.y + n.speedY * time * 60
        // Wrap around
        const wrappedX = ((cx % (starCanvas.width + 200)) + starCanvas.width + 200) % (starCanvas.width + 200) - 100
        const wrappedY = ((cy % (starCanvas.height + 200)) + starCanvas.height + 200) % (starCanvas.height + 200) - 100

        const pulse = Math.sin(time * 0.8 + n.phase) * 0.3 + 0.7
        const grad = ctx.createRadialGradient(wrappedX, wrappedY, 0, wrappedX, wrappedY, n.rx)
        grad.addColorStop(0, `rgba(${n.r}, ${n.g}, ${n.b}, ${n.alpha * pulse * 0.7})`)
        grad.addColorStop(0.5, `rgba(${n.r}, ${n.g}, ${n.b}, ${n.alpha * pulse * 0.3})`)
        grad.addColorStop(1, `rgba(${n.r}, ${n.g}, ${n.b}, 0)`)

        ctx.beginPath()
        ctx.ellipse(wrappedX, wrappedY, n.rx, n.ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // === Stars with parallax layers ===
      const nearbyStars: { x: number; y: number; dist: number }[] = []

      for (const star of stars) {
        const px = star.x
        const py = star.y

        const dx = px - mx
        const dy = py - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximity = Math.max(0, 1 - dist / 180)

        star.r = star.baseR + proximity * 2
        star.opacity = star.baseOpacity + proximity * 0.6

        const twinkle = Math.sin(time * star.speed * 12 + star.phase) * 0.3 + 0.7
        const sy = py + Math.sin(time * 0.8 + star.phase) * 0.6

        // Star glow
        if (star.r > 1.0 || proximity > 0.15) {
          ctx.beginPath()
          ctx.arc(px, sy, star.r * 4, 0, Math.PI * 2)
          const glowAlpha = (proximity > 0.15 ? proximity * 0.15 : 0.025) * twinkle
          ctx.fillStyle = `rgba(180, 200, 240, ${glowAlpha})`
          ctx.fill()
        }

        // Cross sparkle for bright stars
        if (star.layer === 2 && star.baseR > 1.2) {
          const sparkleLen = star.r * 6 * twinkle
          const sparkleAlpha = star.opacity * twinkle * 0.3
          ctx.strokeStyle = `rgba(220, 230, 255, ${sparkleAlpha})`
          ctx.lineWidth = 0.4
          ctx.beginPath()
          ctx.moveTo(px - sparkleLen, sy)
          ctx.lineTo(px + sparkleLen, sy)
          ctx.moveTo(px, sy - sparkleLen)
          ctx.lineTo(px, sy + sparkleLen)
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(px, sy, star.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
        ctx.fill()

        if (dist < 150) {
          nearbyStars.push({ x: px, y: sy, dist })
        }
      }

      // === Constellation lines ===
      if (nearbyStars.length > 1) {
        for (let i = 0; i < nearbyStars.length; i++) {
          for (let j = i + 1; j < nearbyStars.length; j++) {
            const a = nearbyStars[i]
            const b = nearbyStars[j]
            const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
            if (d < 110) {
              const alpha = (1 - d / 110) * 0.22 * (1 - Math.max(a.dist, b.dist) / 150)
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.strokeStyle = `rgba(160, 200, 255, ${alpha})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      }

      // === Mouse light trail ===
      trail.push({ x: mx, y: my, age: 0 })
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += 0.04
        if (trail[i].age >= 1) {
          trail.splice(i, 1)
          continue
        }
        const t = trail[i]
        const alpha = (1 - t.age) * 0.15
        const radius = (1 - t.age) * 8
        ctx.beginPath()
        ctx.arc(t.x, t.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(180, 210, 255, ${alpha})`
        ctx.fill()
      }

      // === Shooting stars ===
      nextShootingStarTime--
      if (nextShootingStarTime <= 0) {
        spawnShootingStar()
        nextShootingStarTime = Math.random() * 280 + 120
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i]
        s.x += s.vx
        s.y += s.vy
        s.life -= 0.01

        if (s.life <= 0 || s.x > starCanvas.width + 50 || s.y > starCanvas.height + 50) {
          shootingStars.splice(i, 1)
          continue
        }

        const mag = Math.sqrt(s.vx * s.vx + s.vy * s.vy)
        const tailFactor = s.length / mag * 0.6
        const tailX = s.x - s.vx * tailFactor
        const tailY = s.y - s.vy * tailFactor

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`)
        grad.addColorStop(0.5, `rgba(200, 220, 255, ${s.opacity * s.life * 0.3})`)
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity * s.life})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(s.x, s.y)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.8
        ctx.lineCap = 'round'
        ctx.stroke()

        // Head glow
        ctx.beginPath()
        ctx.arc(s.x, s.y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 240, 255, ${s.opacity * s.life * 0.5})`
        ctx.fill()

        // Spark particles behind shooting star
        if (Math.random() > 0.5) {
          clickParticles.push({
            x: s.x - s.vx * 0.3 + (Math.random() - 0.5) * 4,
            y: s.y - s.vy * 0.3 + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            life: 0.5 + Math.random() * 0.3,
            r: Math.random() * 1 + 0.3
          })
        }
      }

      // === Click / spark particles ===
      for (let i = clickParticles.length - 1; i >= 0; i--) {
        const p = clickParticles[i]
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.96
        p.vy *= 0.96
        p.life -= 0.018

        if (p.life <= 0) {
          clickParticles.splice(i, 1)
          continue
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215, 164, 73, ${p.life * 0.8})`
        ctx.fill()

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r * p.life * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(215, 164, 73, ${p.life * 0.1})`
        ctx.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    // === Init ===
    resizeCanvas()

    // Create stars in 3 layers
    for (let i = 0; i < 180; i++) {
      const layer = i < 60 ? 0 : i < 130 ? 1 : 2
      const rBase = layer === 0 ? Math.random() * 0.6 + 0.2
                  : layer === 1 ? Math.random() * 1.0 + 0.3
                  : Math.random() * 1.6 + 0.4
      const opBase = layer === 0 ? Math.random() * 0.3 + 0.1
                   : layer === 1 ? Math.random() * 0.5 + 0.2
                   : Math.random() * 0.6 + 0.3
      stars.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        r: rBase, baseR: rBase,
        speed: Math.random() * 0.15 + 0.02,
        opacity: opBase, baseOpacity: opBase,
        phase: Math.random() * Math.PI * 2,
        layer
      })
    }

    // Create nebulae
    const nebulaConfigs = [
      { r: 80, g: 60, b: 160 },   // purple
      { r: 40, g: 80, b: 160 },   // blue
      { r: 60, g: 100, b: 140 },  // teal
      { r: 100, g: 50, b: 130 },  // violet
      { r: 30, g: 70, b: 120 },   // deep blue
    ]
    for (let i = 0; i < 5; i++) {
      const c = nebulaConfigs[i]
      nebulae.push({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height,
        rx: 150 + Math.random() * 200,
        ry: 100 + Math.random() * 120,
        ...c,
        alpha: 0.06 + Math.random() * 0.04,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2
      })
    }

    let frame = 0
    let time = 0

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('click', handleClick)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', resizeCanvas)
    draw()

    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(frame)
    }
  })
</script>

<section class="hero" bind:this={heroEl} style="--scroll-opacity: 1">
  <canvas class="absolute inset-0 pointer-events-none" bind:this={starCanvas}></canvas>

  <div
    class="absolute w-[400px] h-[400px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-500"
    style="background: radial-gradient(circle, rgba(180, 200, 230, 0.08) 0%, rgba(140, 170, 210, 0.03) 40%, transparent 70%)"
    bind:this={cursorGlow}
  ></div>

  <div class="moon-container" bind:this={moon}>
    <img src={withBase('/moon.webp')} alt="Moon" class="moon-img rounded-full" />
    <div class="moon-glow absolute -inset-1/4 rounded-full pointer-events-none"></div>
    <div class="moon-ring absolute -inset-[40%] rounded-full pointer-events-none"></div>
  </div>

  <div class="hero-content">
    <div class="flex flex-col" style="opacity: var(--scroll-opacity)" bind:this={moonText}>
    <p class="hello-type text-[clamp(1rem,2.5vw,1.3rem)] text-muted mb-2 font-normal tracking-wide">
      <span class="hello-chars">
        {#each 'Hello,'.split('') as char, i}
          <span class="hello-char" style="animation-delay: {0.2 + i * 0.08}s">{char}</span>
        {/each}
      </span>
    </p>
    <h1 class="text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.04em]">
      <span class="sunshine-text">
        {#each 'Sunshine'.split('') as char, i}
          <span class="sunshine-char" style="animation-delay: {0.6 + i * 0.07}s">{char}</span>
        {/each}
      </span><br />
      <span class="moon-name text-text">Moon</span>
    </h1>
    <a
      href={site.github}
      target="_blank"
      rel="noopener noreferrer"
      class="cta-btn mt-8 w-fit px-6 py-2.5 rounded-full border border-gold/50 text-gold text-sm font-medium hover:bg-gold/10 hover:border-gold hover:shadow-[0_0_20px_rgba(215,164,73,0.15)] transition-all duration-300"
    >
      GitHub →
    </a>
  </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    height: 100vh;
    min-height: 100vh;
    margin: 0 calc(-50vw + 50%) 0;
    padding: 0 clamp(2rem, 10vw, 12rem);
    background:
      radial-gradient(ellipse 60% 40% at 50% 20%, rgba(40, 60, 100, 0.4) 0%, transparent 100%),
      radial-gradient(ellipse 78% 52% at 50% 28%, #24324f 0%, #1b222c 54%, #161a1f 100%);
    overflow: hidden;
    cursor: default;
  }

  .moon-container {
    position: absolute;
    right: -35%;
    bottom: -50%;
    top: auto;
    transform: none;
    width: clamp(800px, 120vh, 1600px);
    height: clamp(800px, 120vh, 1600px);
    transition: transform 0.6s ease-out;
    z-index: 0;
  }

  .moon-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: drop-shadow(0 0 60px rgba(180, 200, 220, 0.4));
    animation: moonBreath 4s ease-in-out infinite;
  }

  .moon-glow {
    background: radial-gradient(circle, rgba(180, 200, 230, 0.18) 0%, rgba(180, 200, 230, 0.05) 40%, transparent 65%);
    animation: glowPulse 4s ease-in-out infinite;
  }

  .moon-ring {
    border: 1px solid rgba(180, 200, 230, 0.05);
    animation: ringExpand 6s ease-in-out infinite;
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  /* Hello typing */
  .hello-type {
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .hello-char {
    opacity: 0;
    display: inline-block;
    animation: charType 0.3s ease-out forwards;
  }

  /* Sunshine letter-by-letter glow */
  .sunshine-text {
    display: inline-block;
    filter: drop-shadow(0 10px 24px rgba(215, 164, 73, 0.22));
  }

  .sunshine-char {
    opacity: 0;
    display: inline-block;
    background: linear-gradient(135deg, var(--color-gold), var(--color-gold-light), var(--color-gold));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: charGlow 0.5s ease-out forwards;
  }

  /* Moon blur reveal */
  .moon-name {
    opacity: 0;
    display: inline-block;
    filter: blur(12px);
    animation: moonReveal 0.8s ease-out 1.2s forwards;
    text-shadow: 0 12px 30px rgba(0, 0, 0, 0.24);
  }

  .cta-btn {
    opacity: 0;
    animation: fadeUp 0.6s ease-out 1.8s forwards;
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
    50% { transform: translateY(-10px); }
  }

  @keyframes moonBreath {
    0%, 100% { filter: drop-shadow(0 0 40px rgba(180, 200, 220, 0.5)); }
    50% { filter: drop-shadow(0 0 70px rgba(180, 200, 220, 0.7)) drop-shadow(0 0 120px rgba(140, 170, 220, 0.2)); }
  }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.08); }
  }

  @keyframes ringExpand {
    0%, 100% { opacity: 0.3; transform: scale(0.95); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes charType {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes charGlow {
    0% { opacity: 0; transform: translateY(8px) scale(0.9); filter: blur(4px); }
    60% { opacity: 1; transform: translateY(-2px) scale(1.05); filter: blur(0) drop-shadow(0 0 12px rgba(215, 164, 73, 0.6)); }
    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0) drop-shadow(0 0 0 transparent); }
  }

  @keyframes moonReveal {
    from { opacity: 0; filter: blur(12px); transform: scale(0.95); }
    to { opacity: 1; filter: blur(0); transform: scale(1); }
  }

</style>
