[![English](https://img.shields.io/badge/Language-English-2ea44f)](README.md)
[![한국어](https://img.shields.io/badge/Language-한국어-1f6feb)](README.ko.md)

# Lounge FW

React + Vite + Supabase 기반의 커뮤니티 웹앱입니다.

## 개요

- Supabase Auth 인증 (이메일/비밀번호 + GitHub OAuth)
- 게시글 작성/수정 (마크다운 스타일 본문 + 태그 선택)
- 댓글/좋아요 상호작용 및 Realtime 반영
- Full-text search + 태그 필터 검색
- 인증 기반 보호 라우트 제공

## 기술 스택

- React 18
- Vite
- TypeScript
- TanStack Query
- Supabase (Auth, Postgres, Realtime)

## 시작하기

### 1) 의존성 설치

```bash
npm install
```

### 2) 환경변수 설정

`.env.example`을 기준으로 `.env`를 만들고 값을 설정하세요.

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
```

`VITE_SUPABASE_ANON_KEY`도 레거시 호환으로 동작하지만, `VITE_SUPABASE_PUBLISHABLE_KEY` 사용을 권장합니다.

### 3) 개발 서버 실행

```bash
npm run dev
```

## Supabase 로컬 개발

```bash
npx supabase start
npx supabase db reset
```

## 스크립트

- `npm run dev`: Vite 개발 서버 실행
- `npm run typecheck`: TypeScript 타입 검사
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드 결과 미리보기

## 프로젝트 구조

소스 아키텍처는 `src/README.md`를 참고하세요.
