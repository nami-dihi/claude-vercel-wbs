# WBS 앱 완성 실행 계획

> 각 Phase 완료 시 `- [ ]` → `- [x]`로 업데이트

## 최종 체크리스트 (README.md 기준)

- [x] `supabase start`로 Postgres·Studio 컨테이너 기동
- [ ] `npm run dev`로 Next.js 앱이 로컬 Supabase에 연결되어 동작
- [ ] Task 생성/수정/삭제, 부모-자식 계층, 진행률, 담당자, 시작일, due_date, CSV Import/Export 동작
- [ ] 간트형 뷰: start_date~due_date 가로 막대 + 진행률 채우기
- [ ] `main` push → GitHub Actions `db-migrate` 워크플로우 성공(✅)
- [ ] Vercel 공개 URL + 원격 Supabase 연결 정상 동작
- [x] GitHub Issue 탭에 WBS 기능 스펙 이슈 등록

---

## PR 전략 (develop → main)

이슈는 PR merge 시 자동 close (`closes #N` 본문 사용). Phase를 기능 경계로 묶어 PR을 엽니다.

| PR | Phase | 내용 | 상태 |
|---|---|---|---|
| PR #1 | Phase 1~2 | 프로젝트 세팅 + DB 마이그레이션 | ✅ merged ([#13](https://github.com/nami-dihi/claude-vercel-wbs/pull/13)) |
| PR #2 | Phase 3~5 | Task CRUD + 계층 + 필드 편집 | ✅ merged ([#15](https://github.com/nami-dihi/claude-vercel-wbs/pull/15)) |
| PR #3 | Phase 6 | CSV Import/Export | ✅ merged ([#22](https://github.com/nami-dihi/claude-vercel-wbs/pull/22)) |
| PR #4 | Phase 7 | 간트형 시각화 뷰 | ✅ merged ([#26](https://github.com/nami-dihi/claude-vercel-wbs/pull/26)) |
| PR #5 | Phase 8 | Overdue 시각 표시 (목록 뷰) | ✅ merged ([#29](https://github.com/nami-dihi/claude-vercel-wbs/pull/29)) |
| PR #5-1 | Phase 8 | Overdue 시각 표시 (간트 뷰 누락 수정) | 🔄 리뷰 대기 ([#31](https://github.com/nami-dihi/claude-vercel-wbs/pull/31)) |
| PR #6 | Phase 9~10 | CI + 배포 | ⬜ |

> Issue #1은 이미 수동 close됨 (Phase 1 완료). PR #1 merge 시 `closes #2` 로 Issue #2 자동 close 예정.

---

## Phase 0 — 환경 점검 및 GitHub 이슈 등록

- [x] `docker info`, `supabase --version`, `node -v`, `vercel --version`, `gh auth status` 모두 ✅
- [x] GitHub 이슈 11개 등록 (`gh issue create` 루프)

---

## Phase 1 — Next.js 앱 부트스트랩 ✅

**커밋 목표:** `feat: #1 Next.js + Chakra UI v3 + Supabase + Drizzle 부트스트랩`

- [x] `package.json` — next, react, typescript, @chakra-ui/react@^3, @supabase/supabase-js, drizzle-orm, postgres, drizzle-kit
- [x] `tsconfig.json`, `next.config.ts`
- [x] `app/layout.tsx` — ChakraProvider 포함
- [x] `app/providers.tsx` — Chakra UI v3 ColorModeProvider
- [x] `app/page.tsx` — 홈 페이지 골격
- [x] `lib/supabase/client.ts`, `lib/supabase/server.ts`
- [x] `lib/db/schema.ts` — tasks 테이블 (CLAUDE.md §3 정의)
- [x] `lib/db/index.ts` — Drizzle 클라이언트
- [x] `drizzle.config.ts` — CLAUDE.md §6 규약
- [x] `package.json` 스크립트: `db:generate`, `db:migrate`, `db:studio`

---

## Phase 2 — DB 스키마 + 로컬 Supabase 기동 ✅

**커밋 목표:** `feat: #2 tasks 스키마 정의 및 Drizzle 마이그레이션 생성`

- [x] `supabase init` (최초 1회)
- [x] `supabase start` → Docker 컨테이너 기동 확인
- [x] `.env.local` 작성 (supabase status 값 반영)
- [x] `npm run db:generate` → `drizzle/0000_overjoyed_gargoyle.sql` 생성
- [x] `npm run db:migrate` → 로컬 DB에 tasks 테이블 적용
- [ ] Supabase Studio(http://localhost:54323)에서 tasks 테이블 확인 (직접 확인 필요)

---

## Phase 3 — Task 목록 + CRUD API ✅

**커밋 목표:** `feat: #3 Task 생성/수정/삭제 API + 목록 UI`

- [x] `app/api/tasks/route.ts` — GET, POST
- [x] `app/api/tasks/[id]/route.ts` — PUT, DELETE
- [x] `components/task-list.tsx`
- [x] `components/task-row.tsx`
- [x] `components/task-form-modal.tsx`
- [x] `components/task-delete-dialog.tsx`
- [x] `components/status-badge.tsx`
- [x] `components/task-menu.tsx`
- [x] `app/page.tsx` — TaskList + "Task 추가" 버튼
- [x] Playwright J1·J2·J6·J7·J8 시나리오 통과

---

## Phase 4 — 부모-자식 계층 + 들여쓰기 ✅

**커밋 목표:** `feat: #4 Task 계층 표시 및 들여쓰기`

- [x] GET /api/tasks 트리 구조 재구성 (parentId 기준)
- [x] TaskRow에 depth prop → paddingLeft 들여쓰기
- [x] 부모 Task ▼/▶ 토글 아이콘
- [x] ⋯ 메뉴 "하위 Task 추가" 항목
- [x] J3(하위 Task 생성), J4(접기/펼치기) 시나리오 통과

---

## Phase 5 — 필드 편집 ✅

**커밋 목표:** `feat: #5 진행률·상태·담당자·날짜 편집`

- [x] TaskFormModal — 진행률(Slider), 상태(Select), 담당자(Input), 시작일/목표 기한(date Input)
- [x] 유효성: dueDate >= startDate (J17)
- [x] 진행률 100% → status 자동 "done" (J5)
- [x] StatusBadge 클릭 인라인 순환 (J6)
- [x] J5, J6, J7, J17 시나리오 수동 검증

---

## Phase 6 — CSV Import/Export ✅

**커밋 목표:** `feat: #6 CSV Import/Export`

- [x] `components/csv-export-button.tsx` — `wbs-YYYY-MM-DD.csv` 다운로드
- [x] `components/csv-import-button.tsx` — 파일 선택 → 미리보기 → 적용
- [x] `app/api/tasks/import/route.ts` — 배치 insert
- [x] J10(Export), J11(Import 성공), J12(Import 부분 오류) 시나리오 검증

---

## Phase 7 — 간트형 시각화 뷰 ✅

**커밋 목표:** `feat: #7 간트형 일정 시각화 뷰`

- [x] `components/gantt-view.tsx` — 좌측 트리 + 우측 날짜 그리드
- [x] "목록 | 간트" 탭 토글 (Chakra UI Tabs)
- [x] 주(week) 단위 컬럼 헤더 + 오늘 수직선
- [x] Task 막대: start_date~due_date, 진행률 채우기
- [x] 날짜 없는 Task "— 일정 없음 —" 표시
- [x] J13, J14, J16 시나리오 검증

---

## Phase 8 — Overdue 시각 표시 ✅

**커밋 목표:** `feat: #11 기한 초과(Overdue) Task 시각 표시`

- [x] 목록 뷰: dueDate 빨간 텍스트 + "기한 초과" 배지
- [x] 간트 뷰: 막대에 빨간 테두리 또는 빗금 오버레이
- [x] J9 시나리오 검증
- [x] J15 시나리오 검증

---

## Phase 9 — Supabase Cloud + GitHub Actions CI

- [ ] Supabase Cloud 프로젝트 생성 (리전: Northeast Asia Seoul)
- [ ] Direct URL (port 5432) 수집 → `PRODUCTION_DATABASE_URL`
- [ ] Transaction Pooler URL (port 6543) 수집 → Vercel용 `DATABASE_URL`
- [ ] GitHub Settings → Environments → `production` 생성 + secret 등록
- [ ] `develop` → `main` 병합 후 push
- [ ] `gh run watch` → `db-migrate` 워크플로우 ✅ 확인
- [ ] Supabase Studio Table Editor에서 tasks 테이블 확인

---

## Phase 10 — Vercel 배포

- [ ] Vercel 프로젝트 연결 (`vercel`)
- [ ] 환경변수 등록: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` (Transaction Pooler)
- [ ] `vercel --prod` → 공개 URL 획득
- [ ] 배포 URL에서 Task CRUD, CSV, 간트, Overdue 전 기능 동작 확인

---

## 핵심 생성 파일 목록

```
app/
  layout.tsx
  page.tsx
  providers.tsx
  api/tasks/route.ts
  api/tasks/[id]/route.ts
  api/tasks/import/route.ts
components/
  task-list.tsx
  task-row.tsx
  task-form-modal.tsx
  task-delete-dialog.tsx
  task-menu.tsx
  status-badge.tsx
  gantt-view.tsx
  csv-export-button.tsx
  csv-import-button.tsx
lib/db/schema.ts
lib/db/index.ts
lib/supabase/client.ts
lib/supabase/server.ts
drizzle.config.ts
package.json
tsconfig.json
next.config.ts
.env.local  ← git 커밋 안 함
```
