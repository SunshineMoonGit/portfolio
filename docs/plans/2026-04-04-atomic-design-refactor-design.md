# Atomic Design Refactor Design

## Goal

`apps/web`를 읽기 좋은 다크 테마 기반으로 정리하면서, 점진적으로 atomic design 구조로 전환한다. 동시에 반복되는 하드코딩 스타일과 UI 패턴을 공용화하고, 인증/권한 UI는 서버 역할 기반으로 단순화한다.

## Why This Approach

한 번에 전체 화면을 갈아엎으면 회귀 위험이 크다. 이 프로젝트는 이미 동작 중인 홈, 노트, 인증, 관리자 화면이 있으므로, 디자인 토큰과 공용 컴포넌트를 먼저 세우고 핵심 화면부터 순차 전환하는 방식이 안전하다.

## Design Direction

- 테마는 단일 다크 모드로 유지한다.
- 전체 UI는 순수 블랙이 아니라 차콜 기반으로 통일한다.
- 포인트 컬러는 골드를 유지하되, CTA/활성 상태/링크/강조에만 제한적으로 사용한다.
- 홈 hero의 밤하늘 무드는 유지하되, 본문 영역은 읽기 좋은 중립 다크 시스템으로 분리한다.

## Target Architecture

### Tokens

전역 토큰은 아래 범주로 재정의한다.

- color
- typography
- spacing
- radius
- shadow
- motion
- state

토큰은 `app.css`와 공용 스타일 레이어에 모으고, 컴포넌트 내부 hex 값과 임시 그림자를 제거한다.

### Atomic Layers

#### Atoms

- Button
- IconButton
- Input
- Label
- Badge
- Avatar
- Divider
- Surface
- Heading/Text primitives

#### Molecules

- NavLink group
- User menu trigger
- Login action row
- Note meta row
- Project meta chip row
- CodeBlock header
- Comment item

#### Organisms

- AppHeader
- AppFooter
- LoginModal
- HeroSection
- ProjectGrid
- NoteList
- CommentSection

#### Templates

- DefaultPageTemplate
- CollectionPageTemplate
- DetailPageTemplate
- AdminPageTemplate

## Migration Strategy

### Phase 1

- 단일 다크 테마 확정
- 전역 토큰 재정의
- Header/Footer/LoginModal 공용화
- 홈과 노트 상세의 핵심 UI를 atomic 구조로 분해

### Phase 2

- 노트 목록/프로젝트 목록 공통 카드 시스템 도입
- 댓글/좋아요/메타 블록 분리
- 코드블럭 렌더링 UI를 독립 컴포넌트로 정리

### Phase 3

- 관리자 화면을 별도 템플릿과 폼 primitives로 전환
- 남은 접근성 경고 해소
- 반복되는 fetch/auth 분기 정리

## Hardcoding Removal Targets

- 페이지 내부 직접 색상값
- 반복되는 border/background/text 조합
- 카드/버튼/모달/배지 클래스 중복
- 코드블럭과 nav 내부 임시 스타일
- 페이지마다 흩어진 role 기반 UI 분기

## Security And Structure Cleanup

- 인증 UI는 Google-only 흐름만 남긴다.
- 관리자 노출은 서버 role 응답만 신뢰한다.
- 민감 설정은 환경변수로만 유지하고 프론트에는 노출하지 않는다.
- 향후 사용자 설정이 생겨도 브라우저 저장과 서버 저장 책임을 분리한다.

## First Implementation Slice

첫 번째 실제 전환 범위는 아래로 고정한다.

- 전역 design tokens
- Header/Footer
- LoginModal
- 홈 Hero/Projects/Notes 섹션
- 노트 상세 메타/코드블럭

이 범위가 끝나면 시각적 일관성과 구조적 기반이 동시에 생긴다. 이후 노트 목록과 관리자 화면을 같은 규칙으로 옮긴다.
