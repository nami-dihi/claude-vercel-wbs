---
trigger: always_on
---

# PR 템플릿

## 제목

```
feat: [Phase 범위] [내용 요약]
```

예: `feat: Phase 1-2 Task 목록 조회 및 생성 API 구현`

## 본문

```markdown
## Summary

- <변경 내용 1>
- <변경 내용 2>
- <변경 내용 3>

## 수동 확인 체크리스트

> 자동화 테스트로 검증되지 않는 항목만 기재한다.

- [ ] <확인 항목 1>
- [ ] <확인 항목 2>

closes #<이슈번호>

🤖 Generated with Gemini
```

## 작성 규칙

- **제목**: `feat:` + Phase 범위(예: `Phase 1-2`) + 한 줄 요약
- **Summary**: 이 PR에서 바뀐 것. 왜 바꿨는지 위주로.
- **수동 확인 체크리스트**: Playwright로 검증 불가한 항목만. 없으면 섹션 자체를 생략.
- **`closes #N`**: 관련 이슈 번호를 반드시 포함해 PR merge 시 이슈가 자동 close되도록 한다.
- **base → head**: `main ← develop`
