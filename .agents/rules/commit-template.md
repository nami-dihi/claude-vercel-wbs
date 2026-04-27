---
trigger: always_on
---

# 커밋 메시지 템플릿

```
<type>: #<이슈번호> <이슈 제목 요약>

- <변경 내용 1>
- <변경 내용 2>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## 작성 규칙

- **`<type>`**: Conventional Commits 형식 — `feat` / `fix` / `chore` / `docs` / `refactor`
- **`#<이슈번호>`**: GitHub 이슈 번호를 반드시 포함한다
- **본문 bullet**: 무엇을 왜 바꿨는지 한 줄씩. "무엇을 하는지"가 아닌 "왜"를 중심으로.
- **Co-Authored-By**: 항상 마지막 줄에 포함한다

## 예시

```
feat: #12 Task 생성 모달 구현

- 빈 제목 제출 방지를 위해 클라이언트 유효성 검사 추가
- 저장 후 목록 자동 갱신 (SWR mutate)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
