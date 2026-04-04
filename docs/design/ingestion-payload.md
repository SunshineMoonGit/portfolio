# Ingestion Payload

## 개요

`notes` 레포에 push가 발생하면 GitHub Actions가 `portfolio` API의 ingestion endpoint를 호출한다.  
이 문서는 그 호출의 형식을 정의한다.

---

## Endpoint

```
POST /api/ingest
```

---

## Request

### Headers

```http
Content-Type: application/json
X-Ingest-Token: <secret>
```

`X-Ingest-Token`은 GitHub Actions secret으로 관리한다.  
API는 이 토큰을 검증해 인가되지 않은 요청을 거부한다.

### Body

```json
{
  "files": [
    {
      "path": "backend/jwt-auth-basics.md",
      "content": "---\ntitle: \"JWT 인증 정리\"\nslug: \"jwt-auth-basics\"\n...\n---\n\n## 개요\n\nJWT는 ...",
      "action": "upsert"
    },
    {
      "path": "infra/old-note.md",
      "slug": "old-note",
      "content": null,
      "action": "delete"
    }
  ]
}
```

### 필드 정의

| 필드              | 타입                     | 필수                | 설명                                              |
|-------------------|--------------------------|---------------------|---------------------------------------------------|
| `files`           | FileEntry[]              | ✓                   | 변경된 파일 목록                                  |
| `files[].path`    | string                   | ✓                   | notes 레포 내 경로 (public/ 기준 상대 경로)       |
| `files[].slug`    | string                   | delete 시 ✓         | 삭제 대상 slug. CI가 삭제 전 파일에서 추출해 포함 |
| `files[].content` | string \| null           | upsert 시 ✓         | 파일 전체 내용 (삭제 시 null)                     |
| `files[].action`  | `"upsert"` \| `"delete"` | ✓                   | 처리 방식                                         |

---

## 처리 흐름

### 배치 처리 방식

**Partial success**: 파일 단위로 독립 처리한다.  
한 파일이 실패해도 나머지는 계속 처리한다.  
응답에 성공/실패 목록을 모두 포함한다.

### upsert

1. `content`에서 frontmatter를 파싱한다.
2. 필수 필드(`title`, `slug`, `date`, `category`) 유효성을 검사한다.
3. `slug` 기준으로 임시 파일에 쓴 뒤 `data/notes/<slug>.json`으로 atomic rename한다.
4. `data/index.json`을 갱신한다 (정렬: `date desc, slug asc`).

### delete

1. payload의 `slug` 필드를 우선 사용한다.
2. `slug`가 없으면 `index.json`에서 `sourcePath === path`인 항목을 찾아 slug를 역조회한다.
3. `data/notes/<slug>.json`을 삭제한다.
4. `data/index.json`에서 해당 항목을 제거한다.

### content 저장 형식

raw Markdown으로 저장한다. HTML 변환은 하지 않는다.  
렌더링은 SvelteKit(`apps/web`)에서 담당한다.  
이유: 재ingest 없이 렌더링 방식 변경이 가능해야 하기 때문.

---

## Response

### 성공 (전체 또는 부분)

```json
{
  "processed": [
    { "slug": "jwt-auth-basics", "action": "upsert" },
    { "slug": "old-note", "action": "delete" }
  ],
  "errors": []
}
```

### 부분 실패

```json
{
  "processed": [
    { "slug": "jwt-auth-basics", "action": "upsert" }
  ],
  "errors": [
    {
      "path": "backend/broken-note.md",
      "reason": "missing required field: slug"
    }
  ]
}
```

HTTP 상태 코드는 처리된 파일이 하나라도 있으면 `200`, 전부 실패하면 `422`.

---

## CI 책임

GitHub Actions는 delete 액션을 만들 때 반드시 slug를 포함해야 한다.  
삭제 직전 `git show HEAD~1:<path>` 또는 `git diff --name-status`로 이전 커밋에서 파일을 읽어 frontmatter의 slug를 추출한다.

```yaml
- name: Trigger ingestion
  run: |
    curl -X POST ${{ secrets.PORTFOLIO_API_URL }}/api/ingest \
      -H "Content-Type: application/json" \
      -H "X-Ingest-Token: ${{ secrets.INGEST_TOKEN }}" \
      -d "$PAYLOAD"
```

변경 파일 목록은 `git diff --name-status HEAD~1 HEAD` 또는 GitHub Actions의 `paths-filter`로 수집한다.
