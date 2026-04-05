# portfolio

https://sunshinemoon.cloud

정적 SvelteKit 기반 개인 포트폴리오 겸 지식 노트 사이트. 서버 런타임 없이 별도 `vault` 저장소의 Markdown과 JSON을 빌드 시점에 정규화해 GitHub Pages로 배포.

## Architecture

```
vault (private repo)                    portfolio (this repo)
  public/                                 scripts/build-content.ts
    profile.json    ──push──→ dispatch ──→   ↓
    notes/*.md                             apps/web/src/lib/generated/*.json
    project/*.md                             ↓
                                           SvelteKit adapter-static
                                             ↓
                                           GitHub Pages
```

- vault push → `repository_dispatch: vault-updated` → portfolio 자동 리빌드
- portfolio push → 직접 빌드/배포
- 검색, 태그, 관련 노트, 백링크는 전부 정적 데이터 + 브라우저 로직

## Repository Layout

```
apps/
  web/                     # SvelteKit static frontend
packages/
  content-types/           # 공유 TypeScript 타입
scripts/
  build-content.ts         # vault → generated JSON 변환
  check-base-path.sh       # base path 링크 검증
```

## Local Development

```bash
pnpm install

# vault 경로 지정 후 콘텐츠 생성
VAULT_SOURCE_DIR=/path/to/vault pnpm build:content

# 개발 서버
pnpm dev:web

# 타입 검증
pnpm check:web

# 정적 빌드
pnpm build:web
```

## CI/CD

`.github/workflows/deploy-pages.yml`:

1. portfolio + vault(sparse-checkout: `public/`, `notes/`, `project/`) checkout
2. `pnpm build:content` → generated JSON
3. `pnpm --filter web build` → 정적 빌드
4. GitHub Pages 배포

트리거: `push to main` | `repository_dispatch: vault-updated` | `workflow_dispatch`

## GitHub Secrets & Variables

### Secrets (필수)

| Name | 용도 |
|------|------|
| `VAULT_REPO_TOKEN` | vault repo Contents: Read (fine-grained PAT) |

### Variables (선택)

| Name | 용도 |
|------|------|
| `PAGES_BASE_PATH` | base path (기본값: repo 이름) |
| `PUBLIC_GISCUS_REPO` | Giscus 댓글 설정 |
| `PUBLIC_GISCUS_REPO_ID` | |
| `PUBLIC_GISCUS_CATEGORY` | |
| `PUBLIC_GISCUS_CATEGORY_ID` | |

## Tech Stack

- **Framework**: SvelteKit + adapter-static
- **Styling**: Tailwind CSS v4
- **Markdown**: marked
- **Package Manager**: pnpm workspace
- **Deploy**: GitHub Pages + GitHub Actions
