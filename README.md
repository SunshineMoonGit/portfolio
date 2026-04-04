# portfolio

정적 SvelteKit 기반 개인 포트폴리오 겸 지식 노트 사이트입니다. 서버 런타임 없이 별도 `vault` 저장소의 Markdown과 JSON 소스를 빌드 시점에 정규화해 GitHub Pages로 배포합니다.

## Architecture

현재 구조는 `SvelteKit only` 입니다.

- 원본 데이터
  - private `SunshineMoonGit/vault` 저장소
  - `public/notes/*.md`
  - `project/*.md`
  - `public/profile.json`
- 콘텐츠 생성
  - `scripts/build-content.ts`가 `VAULT_SOURCE_DIR` 경로에서 Markdown/frontmatter를 읽어 `apps/web/src/lib/generated/*.json` 생성
- 웹 앱
  - `apps/web`의 SvelteKit 정적 사이트가 generated JSON만 읽어 렌더링
- 배포
  - GitHub Actions가 콘텐츠 생성 후 `adapter-static` 빌드를 수행하고 GitHub Pages로 배포

요청 시 서버가 하는 일은 없습니다. 검색, 태그, 관련 노트, 백링크는 전부 정적 데이터와 브라우저 로직으로 처리합니다.

## Repository Layout

```text
portfolio/
  apps/
    web/                       # SvelteKit static frontend
  docs/
    plans/
  packages/
    content-types/
  scripts/
    build-content.ts
```

## Local Commands

의존성 설치:

```bash
pnpm install
```

콘텐츠 생성:

```bash
pnpm build:content
```

다른 위치의 vault를 직접 지정:

```bash
VAULT_SOURCE_DIR=/absolute/path/to/vault pnpm build:content
```

프론트 개발 서버:

```bash
pnpm --filter web dev
```

타입/라우트 검증:

```bash
pnpm --filter web check
```

정적 빌드:

```bash
pnpm --filter web build
```

루트 `Makefile`도 동일한 흐름을 래핑합니다.

## GitHub Pages Deployment

`/.github/workflows/deploy-pages.yml`이 `main` 브랜치 push 또는 수동 실행 시 아래 순서로 동작합니다.

1. `pnpm install --frozen-lockfile`
2. private `SunshineMoonGit/vault` 저장소를 `vault-source`로 checkout
3. `pnpm build:content`
4. `pnpm --filter web build`
5. `apps/web/build` 업로드
6. GitHub Pages 배포

프로젝트 사이트 배포에서는 base path가 필요하므로 workflow가 기본적으로 저장소 이름을 `BASE_PATH`로 사용합니다.

- 예: 저장소가 `portfolio`면 사이트 경로는 `/portfolio`
- 커스텀 도메인을 붙여 루트(`/`)에 서비스할 때는 repository variable `PAGES_BASE_PATH`를 빈 값 대신 원하는 값으로 명시 관리해야 합니다.
  - 루트 도메인 배포: `PAGES_BASE_PATH`를 `/` 대신 빈 문자열로 관리하는 방식이 필요합니다.
  - 현재 workflow 기본값은 project-site 안전성을 우선해 `repository.name` 입니다.

## Custom Domain Notes

이 리포에는 `CNAME` 파일을 자동 생성하지 않습니다.

- 이미 사용하는 커스텀 도메인이 확정되어 있으면 `apps/web/static/CNAME`에 직접 도메인을 추가하면 됩니다.
- DNS는 GitHub Pages 문서 기준으로 설정해야 합니다.
- 커스텀 도메인을 붙이면 base path 전략도 같이 점검해야 합니다.

## Giscus

노트 상세 페이지는 Giscus를 붙일 수 있습니다. 설정이 없으면 댓글 UI는 렌더되지 않습니다.

GitHub repository variables 또는 로컬 공개 env로 사용할 값:

- `PUBLIC_GISCUS_REPO`
- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY`
- `PUBLIC_GISCUS_CATEGORY_ID`
- `PUBLIC_GISCUS_MAPPING`
- `PUBLIC_GISCUS_STRICT`
- `PUBLIC_GISCUS_REACTIONS_ENABLED`
- `PUBLIC_GISCUS_INPUT_POSITION`
- `PUBLIC_GISCUS_LANG`
- `PUBLIC_GISCUS_THEME`

최소 필수값:

- `PUBLIC_GISCUS_REPO`
- `PUBLIC_GISCUS_REPO_ID`
- `PUBLIC_GISCUS_CATEGORY`
- `PUBLIC_GISCUS_CATEGORY_ID`

## Required GitHub Secret

`portfolio` 저장소 Actions가 private `vault` 저장소를 읽을 수 있어야 합니다.

- `VAULT_REPO_TOKEN`
  - 권한: `SunshineMoonGit/vault`의 `Contents: Read`
  - 권장: fine-grained PAT

## Content Rules

- 공개 노트는 `vault` 저장소의 `public/notes` 아래에 둡니다.
- 프로젝트 상세는 `vault` 저장소의 `project` 아래 Markdown으로 관리합니다.
- 프로필은 `vault` 저장소의 `public/profile.json`을 기준으로 읽습니다.
- slug, tag, category, summary는 build step에서 정규화됩니다.

## Deployment Summary

- 로컬 노트북 포트 오픈 없음
- 런타임 API 없음
- GitHub Pages가 정적 결과물만 서빙
- 댓글은 Giscus/GitHub Discussions 사용
