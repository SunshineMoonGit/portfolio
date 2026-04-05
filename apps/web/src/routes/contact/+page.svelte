<script lang="ts">
  let formStatus: 'idle' | 'sending' | 'sent' | 'error' = $state('idle')

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
  <title>Contact — sunshinemoon</title>
</svelte:head>

<section class="py-14">
  <div class="text-center mb-12">
    <h1 class="text-2xl font-bold mb-3">Contact</h1>
    <p class="text-subtle text-sm">궁금한 점이나 제안이 있으시면 편하게 연락주세요.</p>
  </div>

  <div class="form-card mx-auto max-w-[480px] rounded-2xl border border-border bg-dark-card/50 p-8 backdrop-blur-sm">
    {#if formStatus === 'sent'}
      <div class="text-center py-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full border border-gold/30 bg-gold/5 mb-5">
          <svg class="w-6 h-6 text-gold" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <p class="text-gold font-medium mb-1">메시지가 전송되었습니다.</p>
        <p class="text-subtle text-sm">빠르게 확인하고 답변드리겠습니다.</p>
        <button onclick={() => formStatus = 'idle'} class="mt-6 text-sm text-muted hover:text-gold transition-colors">새 메시지 작성 →</button>
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
          <label for="name" class="block text-xs text-subtle mb-1.5 uppercase tracking-wider">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="Your name"
            class="w-full rounded-lg border border-border bg-dark/80 px-4 py-3 text-sm text-text placeholder:text-subtle/40 focus:border-gold/50 focus:shadow-[0_0_0_3px_rgba(215,164,73,0.08)] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label for="email" class="block text-xs text-subtle mb-1.5 uppercase tracking-wider">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="email@example.com"
            class="w-full rounded-lg border border-border bg-dark/80 px-4 py-3 text-sm text-text placeholder:text-subtle/40 focus:border-gold/50 focus:shadow-[0_0_0_3px_rgba(215,164,73,0.08)] focus:outline-none transition-all"
          />
        </div>

        <div>
          <label for="message" class="block text-xs text-subtle mb-1.5 uppercase tracking-wider">Message</label>
          <textarea
            id="message"
            name="message"
            required
            rows="5"
            placeholder="Write your message here..."
            class="w-full rounded-lg border border-border bg-dark/80 px-4 py-3 text-sm text-text placeholder:text-subtle/40 focus:border-gold/50 focus:shadow-[0_0_0_3px_rgba(215,164,73,0.08)] focus:outline-none transition-all resize-y"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={formStatus === 'sending'}
          class="w-full py-3 rounded-lg bg-gold text-dark text-sm font-semibold hover:bg-gold-light hover:shadow-[0_4px_20px_rgba(215,164,73,0.25)] transition-all disabled:opacity-50"
        >
          {formStatus === 'sending' ? '전송 중...' : 'Send Message'}
        </button>

        {#if formStatus === 'error'}
          <p class="text-red-400 text-sm text-center">전송에 실패했습니다. 다시 시도해주세요.</p>
        {/if}
      </form>
    {/if}
  </div>

  <div class="flex items-center justify-center gap-6 mt-10">
    <a href="https://github.com/SunshineMoonGit" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-sm text-subtle hover:text-gold transition-colors">
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
      GitHub
    </a>
    <span class="text-border">·</span>
    <a href="mailto:sunshinemoongit@gmail.com" class="flex items-center gap-2 text-sm text-subtle hover:text-gold transition-colors">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
      Email
    </a>
  </div>
</section>

<style>
  .form-card {
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.03),
      0 8px 40px rgba(0, 0, 0, 0.3),
      0 0 80px rgba(40, 60, 100, 0.08);
  }
</style>
