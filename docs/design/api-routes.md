# API Routes

FastAPI (`apps/api`)가 제공하는 전체 엔드포인트 정의.

---

## Content API

### GET /api/notes

노트 목록 반환. `content` 필드 제외.

**Query Parameters**

| 파라미터   | 타입   | 필수 | 설명                        |
|------------|--------|------|-----------------------------|
| `category` | string |      | 카테고리 필터               |
| `limit`    | int    |      | 반환 개수 제한 (기본값: 전체) |

**Response**

```json
[
  {
    "slug": "jwt-auth-basics",
    "title": "JWT 인증 정리",
    "category": "backend",
    "tags": ["auth", "jwt"],
    "summary": "JWT 인증 흐름과 refresh token 메모",
    "date": "2026-04-04",
    "updatedAt": "2026-04-04T10:00:00Z"
  }
]
```

---

### GET /api/notes/{slug}

단일 노트 반환. `content` 포함. 이전/다음 노트 정보 포함.

**Response**

```json
{
  "slug": "jwt-auth-basics",
  "title": "JWT 인증 정리",
  "category": "backend",
  "tags": ["auth", "jwt"],
  "summary": "JWT 인증 흐름과 refresh token 메모",
  "date": "2026-04-04",
  "updatedAt": "2026-04-04T10:00:00Z",
  "content": "## 개요\n\nJWT는 ...",
  "sourcePath": "backend/jwt-auth-basics.md",
  "prev": { "slug": "docker-basics", "title": "Docker 정리" },
  "next": { "slug": "rest-api-design", "title": "REST API 설계 원칙" }
}
```

`prev` / `next`는 `date desc, slug asc` 정렬 기준 인접 노트. 없으면 `null`.

**Error**

```json
{ "detail": "Note not found" }   // 404
```

---

### GET /api/profile

포트폴리오 메인 페이지에 필요한 프로필 데이터 반환.

**Response**

```json
{
  "name": "홍길동",
  "headline": "백엔드 개발자, 꾸준히 배우는 사람",
  "interests": ["backend", "infra", "distributed systems"],
  "projects": [
    {
      "name": "portfolio",
      "description": "학습 노트를 포트폴리오로 재가공하는 시스템",
      "techs": ["SvelteKit", "FastAPI", "pnpm"],
      "url": "https://github.com/username/portfolio"
    }
  ]
}
```

데이터 출처: `data/profile.json` (레포에서 직접 편집).

---

## Ingestion API

### POST /api/ingest

`notes` 레포의 GitHub Actions가 호출. 상세 내용은 `ingestion-payload.md` 참조.

**Auth**: `X-Ingest-Token` 헤더 필수.

---

## 공통 규칙

- 모든 응답은 `application/json`
- 인증이 필요한 엔드포인트는 `X-Ingest-Token`으로 처리 (Content API는 인증 없음)
- 에러 형식: `{ "detail": "<message>" }` (FastAPI 기본 형식 그대로 사용)
