---
description: /plan-task로 선정된 이슈를 구현하고, 빌드·Playwright 테스트 후 커밋·이슈 업데이트·PR 생성까지 완료한다.
---


# /implement-task

`/plan-task`에서 선정된 이슈를 실제로 구현하고, 검증 후 커밋·PR까지 완료하는 스킬.

---

## 선행 조건

- `/plan-task`가 완료되어 "작업 이슈 #N"과 "PLAN.md Phase N"이 확정된 상태
- 로컬 Supabase 컨테이너 및 Next.js dev 서버가 기동 중이어야 한다.
  - `supabase status`로 컨테이너 확인, `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`으로 dev 서버 확인
  - 둘 중 하나라도 준비되지 않았으면 `/dev-server` 스킬을 먼저 실행한다.

---

## 절차

### 5. 코드 구현

`PLAN.md` 해당 Phase의 체크리스트를 기준으로 파일을 생성·수정한다.

- GEMINI.md §4 디렉토리 컨벤션을 따른다 (kebab-case 파일명, PascalCase 컴포넌트명)
- UI 구현 시 `DESIGN-supabase.md`를 단일 기준으로 따른다
- 클라이언트 컴포넌트에서 DB에 직접 접근하지 않는다 — 반드시 API Route / Server Action 경유
- 한 번에 너무 많은 파일을 수정하지 않는다. Phase 단위로 커밋하는 것을 원칙으로 한다

### 6. 로컬 빌드 + 린트

```bash
npm run build
```

- 빌드 실패 시 → 오류를 수정하고 재빌드. 통과할 때까지 다음 단계로 넘어가지 않는다.
- 타입 오류·ESLint 오류는 모두 해결한다.

### 7. Playwright MCP 테스트

`USER_JOURNEY.md`에서 현재 Phase와 관련된 시나리오(J번호)를 확인하고 순서대로 검증한다.

- dev 서버가 실행 중이어야 한다 (`http://localhost:3000`)
- 각 시나리오 결과를 "J1 통과 ✅ / J2 실패 ❌" 형식으로 보고한다
- **실패 시나리오가 있으면** → 원인을 파악하고 코드를 수정한 뒤 5단계부터 재시작
- **모두 통과** → 다음 단계로 진행

### 8. 커밋 + push

```bash
git add <관련 파일>
git commit -m "feat: #N [이슈 제목 요약]\n\n- 변경 내용 요약\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin develop
```

- Conventional Commits 형식 사용 (`feat:`, `fix:`, `chore:` 등)
- 이슈 번호를 커밋 메시지에 포함한다 (`feat: #N ...`)

### 9. PLAN.md 체크박스 업데이트

완료된 Phase 항목을 `[ ]` → `[x]`로 변경하고, Phase 제목에 `✅`를 추가한다.

### 10. 이슈 체크리스트 업데이트

```bash
gh issue edit N --body "..."
```

해당 이슈의 체크리스트에서 완료된 항목을 `- [ ]` → `- [x]`로 변경한다.

### 11. PR 전략 확인 → PR 생성 여부 결정

`PLAN.md`의 **PR 전략 표**를 확인한다.

**PR을 열어야 하는 경우** (현재 Phase가 해당 PR 묶음의 마지막 Phase인 경우):
1. `git push origin develop` 확인
2. PR 생성:
   ```bash
   gh pr create --base main --head develop \
     --title "feat: [Phase 범위] [내용 요약]" \
     --body "..."
   ```
   - PR 본문: Summary(변경 내용), 수동 확인 체크리스트(자동화 불가 항목만)
   - `closes #N` 으로 관련 이슈 자동 close 연결
3. PLAN.md PR 전략 표의 상태를 `🔄 리뷰 대기 ([#PR번호](url))`로 업데이트

**아직 PR을 열지 않는 경우** (Phase 묶음이 완료되지 않은 경우):
- "PR은 Phase N 완료 후 생성 예정입니다."라고 안내하고 종료

### 완료 메시지

```
✅ 구현 완료
- 커밋: [커밋 해시 앞 7자]
- 테스트: J[번호들] 통과
- 이슈 #N 체크리스트 업데이트 완료
- [PR #M 생성됨 / PR은 Phase N 완료 후 생성 예정]
```

---

## 규칙

- 빌드 실패 또는 Playwright 시나리오 실패 시 커밋하지 않는다.
- `--no-verify` 등 훅 우회는 절대 사용하지 않는다.
- `.env.local`, `.env` 등 환경변수 파일은 커밋하지 않는다.
- UI는 항상 `DESIGN-supabase.md` 기준을 따른다.
- PR은 PLAN.md PR 전략 표의 Phase 묶음 단위로만 생성한다 (Phase마다 PR을 열지 않는다).
- 한국어로 대화한다.
