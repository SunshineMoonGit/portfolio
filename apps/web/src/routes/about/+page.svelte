<script lang="ts">
  import { base } from '$app/paths'

  let formStatus: 'idle' | 'sending' | 'sent' | 'error' = $state('idle')

  function withBase(path: string): string {
    return `${base}${path}`
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    formStatus = 'sending'

    const form = e.target as HTMLFormElement
    const data = new FormData(form)

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      })
      if (res.ok) {
        formStatus = 'sent'
        form.reset()
      } else {
        formStatus = 'error'
      }
    } catch {
      formStatus = 'error'
    }
  }
</script>

<svelte:head>
  <title>About — sunshinemoon</title>
</svelte:head>

<section class="py-14">
  <h1 class="text-3xl font-bold mb-2">Sunshine Moon</h1>
  <p class="text-subtle text-sm mb-10">Backend Developer · Security & Infrastructure</p>

  <div class="space-y-6 text-[0.95rem] leading-relaxed text-text-dim">
    <p>
      백엔드 개발과 인프라/보안에 관심이 많은 개발자입니다.
      안정적이고 안전한 시스템을 설계하는 데 집중하고 있습니다.
    </p>
    <p>
      배운 것들을 <a href={withBase('/notes')} class="text-gold hover:underline">노트</a>로 정리하고,
      직접 만든 것들을 <a href={withBase('/projects')} class="text-gold hover:underline">프로젝트</a>로 공유합니다.
    </p>
  </div>

  <div class="mt-12 mb-10">
    <h2 class="text-lg font-semibold mb-5">Skills</h2>
    <div class="flex flex-wrap gap-2">
      {#each ['Java', 'Spring Boot', 'Python', 'TypeScript', 'MySQL', 'Redis', 'Docker', 'AWS', 'Linux', 'Git', 'CI/CD', 'Network', 'Security'] as skill}
        <span class="px-3 py-1.5 text-xs rounded-full border border-border text-muted hover:border-gold/40 hover:text-gold transition-colors">{skill}</span>
      {/each}
    </div>
  </div>

  <div class="border-t border-border pt-12">
    <h2 class="text-lg font-semibold mb-2">Contact</h2>
    <p class="text-subtle text-sm mb-8">궁금한 점이나 제안이 있으시면 편하게 연락주세요.</p>

    {#if formStatus === 'sent'}
      <div class="rounded-lg border border-gold/30 bg-gold/5 p-6 text-center">
        <p class="text-gold font-medium">메시지가 전송되었습니다.</p>
        <p class="text-subtle text-sm mt-1">빠르게 확인하고 답변드리겠습니다.</p>
        <button onclick={() => formStatus = 'idle'} class="mt-4 text-sm text-muted hover:text-text">새 메시지 작성 →</button>
      </div>
    {:else}
      <form
        action="https://formsubmit.co/sunshinemoongit@gmail.com"
        method="POST"
        onsubmit={handleSubmit}
        class="space-y-5"
      >
        <input type="text" name="_honey" class="hidden" />
        <input type="hidden" name="_captcha" value="false" />

        <div>
          <label for="name" class="block text-sm text-muted mb-1.5">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            class="w-full rounded-lg border border-border bg-dark-card px-4 py-2.5 text-sm text-text placeholder:text-subtle/50 focus:border-gold/60 focus:outline-none transition-colors"
            placeholder="홍길동"
          />
        </div>

        <div>
          <label for="email" class="block text-sm text-muted mb-1.5">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            class="w-full rounded-lg border border-border bg-dark-card px-4 py-2.5 text-sm text-text placeholder:text-subtle/50 focus:border-gold/60 focus:outline-none transition-colors"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label for="message" class="block text-sm text-muted mb-1.5">메시지</label>
          <textarea
            id="message"
            name="message"
            required
            rows="5"
            class="w-full rounded-lg border border-border bg-dark-card px-4 py-2.5 text-sm text-text placeholder:text-subtle/50 focus:border-gold/60 focus:outline-none transition-colors resize-y"
            placeholder="내용을 입력해주세요"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={formStatus === 'sending'}
          class="px-6 py-2.5 rounded-lg bg-gold text-dark text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {formStatus === 'sending' ? '전송 중...' : '보내기'}
        </button>

        {#if formStatus === 'error'}
          <p class="text-red-400 text-sm">전송에 실패했습니다. 다시 시도해주세요.</p>
        {/if}
      </form>
    {/if}
  </div>
</section>
