# Monorepo Structure

## 도구

- **패키지 매니저**: pnpm workspace
- **빌드 오케스트레이션**: 없음 (Phase 1에서는 불필요)
- Python 환경: `apps/api`는 별도 `venv`로 관리

---

## 디렉터리 구조

```
portfolio/
  apps/
    web/              # SvelteKit 프론트엔드
    api/              # FastAPI 백엔드
  packages/
    content-types/    # TypeScript 타입 정의 (web에서만 사용)
  data/
    notes/            # <slug>.json 파일들
    index.json        # 경량 노트 인덱스
    profile.json      # 포트폴리오 메인 데이터
  docs/
    design/
  pnpm-workspace.yaml
  package.json        # 루트 (scripts만, 실제 의존성 없음)
```

---

## pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

---

## apps/web

- SvelteKit
- `packages/content-types`를 로컬 패키지로 의존
- 환경변수: `API_BASE_URL` (FastAPI 주소)

```
apps/web/
  src/
    routes/
      +page.server.ts
      notes/
        +page.server.ts
        [slug]/
          +page.server.ts
    lib/
      api.ts          # API 호출 함수 모음
  package.json
```

---

## apps/api

- FastAPI
- Python 전용, pnpm workspace와 무관
- 자체 `venv` 관리

```
apps/api/
  main.py
  routers/
    notes.py
    profile.py
    ingest.py
  services/
    storage.py        # data/ 파일 읽기/쓰기, atomic write 처리
    parser.py         # Markdown + frontmatter 파싱
  data -> ../../data  # 심볼릭 링크 또는 경로 설정
  requirements.txt
```

---

## packages/content-types

- TypeScript 타입만 포함 (런타임 코드 없음)
- `apps/web`에서 import해서 사용
- Python Pydantic 모델과 별도 관리. 두 모델의 계약은 `api-routes.md`의 응답 스펙을 기준으로 수동 동기화
- Phase 2에서 OpenAPI spec 자동 생성으로 전환 가능

```
packages/content-types/
  src/
    index.ts          # Note, NoteIndex, Profile 타입 export
  package.json
  tsconfig.json
```

**export 예시**

```ts
export interface NoteIndex {
  slug: string
  title: string
  category: string
  tags: string[]
  summary: string
  date: string
  updatedAt: string
}

export interface Note extends NoteIndex {
  content: string
  sourcePath: string
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}

export interface Project {
  name: string
  description: string
  techs: string[]
  url: string
}

export interface Profile {
  name: string
  headline: string
  interests: string[]
  projects: Project[]
}
```

---

## data/profile.json

레포에서 직접 편집하는 포트폴리오 데이터.

```json
{
  "name": "",
  "headline": "",
  "interests": [],
  "projects": []
}
```

---

## 개발 실행

```bash
# web
pnpm --filter web dev

# api
cd apps/api && uvicorn main:app --reload
```

---

## 결정 사항 요약

| 항목                  | 결정                                      |
|-----------------------|-------------------------------------------|
| 패키지 매니저         | pnpm workspace                            |
| 빌드 오케스트레이션   | 없음 (필요 시 Turborepo 추가)             |
| content-core 패키지   | Phase 1 없음                              |
| content-types 패키지 | TypeScript 타입만, web 전용               |
| 메인 데이터 관리      | data/profile.json (레포 직접 편집)        |
| web 데이터 접근       | API 호출 (파일시스템 직접 접근 없음)      |
| atomic write          | 임시 파일 쓰기 후 rename (구현 레벨 처리) |
