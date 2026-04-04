# Content Schema

## Frontmatter (원본 — notes 레포)

Markdown 파일 상단에 작성하는 메타데이터.

```yaml
---
title: "JWT 인증 정리"
slug: "jwt-auth-basics"
category: "backend"
tags: ["auth", "jwt"]
summary: "JWT 인증 흐름과 refresh token 메모"
date: "2026-04-04"
---
```

### 필드 정의

| 필드       | 타입       | 필수 | 설명                                  |
|------------|------------|------|---------------------------------------|
| `title`    | string     | ✓    | 노트 제목                             |
| `slug`     | string     | ✓    | URL에 사용되는 고유 식별자 (kebab-case) |
| `category` | string     | ✓    | 단일 카테고리 (예: backend, frontend) |
| `tags`     | string[]   |      | 복수 태그                             |
| `summary`  | string     |      | 한 줄 요약                            |
| `date`     | string     | ✓    | 최초 작성일 (YYYY-MM-DD)              |

### 제약

- `slug`는 레포 전체에서 고유해야 한다.
- `category`는 소문자 영문, 하이픈만 허용한다.
- `date`는 ISO 8601 날짜 형식(YYYY-MM-DD)만 허용한다.

---

## Normalized Note (저장 형식 — portfolio data/)

API가 파싱 후 `data/notes/` 아래에 저장하는 JSON 구조.

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
  "sourcePath": "backend/jwt-auth-basics.md"
}
```

### 필드 정의

| 필드          | 타입     | 설명                                         |
|---------------|----------|----------------------------------------------|
| `slug`        | string   | frontmatter의 slug 그대로 사용               |
| `title`       | string   | frontmatter의 title                          |
| `category`    | string   | frontmatter의 category                       |
| `tags`        | string[] | frontmatter의 tags (없으면 빈 배열)          |
| `summary`     | string   | frontmatter의 summary (없으면 빈 문자열)     |
| `date`        | string   | frontmatter의 date                           |
| `updatedAt`   | string   | ingestion 시각 (ISO 8601)                    |
| `content`     | string   | frontmatter를 제거한 Markdown 본문           |
| `sourcePath`  | string   | notes 레포 내 원본 파일 경로 (public/ 기준)  |

---

## Index (목록 캐시 — data/index.json)

목록 페이지 렌더링에 사용하는 경량 인덱스.  
`content` 필드는 포함하지 않는다.

```json
[
  {
    "slug": "jwt-auth-basics",
    "title": "JWT 인증 정리",
    "category": "backend",
    "tags": ["auth", "jwt"],
    "summary": "JWT 인증 흐름과 refresh token 메모",
    "date": "2026-04-04",
    "updatedAt": "2026-04-04T10:00:00Z",
    "sourcePath": "backend/jwt-auth-basics.md"
  }
]
```

`sourcePath`는 delete 액션에서 slug 역조회에 사용한다.

정렬 기준: `date` 내림차순, 동일 날짜면 `slug` 오름차순 (`date desc, slug asc`).  
이 순서는 목록, prev/next 계산 모두에 동일하게 적용한다.
