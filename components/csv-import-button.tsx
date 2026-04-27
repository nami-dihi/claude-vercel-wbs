'use client'

import { useRef, useState } from 'react'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'

type Status = 'todo' | 'doing' | 'done'

const STATUS_MAP: Record<string, Status> = {
  '할 일': 'todo', 'todo': 'todo',
  '진행 중': 'doing', 'doing': 'doing',
  '완료': 'done', 'done': 'done',
}

interface ParsedRow {
  title: string
  description: string | null
  assignee: string | null
  status: Status
  progress: number
  startDate: string | null
  dueDate: string | null
  parentTitle: string | null
  parentId: string | null
  warnings: string[]
}

interface ExcludedRow {
  line: number
  reason: string
}

interface Preview {
  rows: ParsedRow[]
  excluded: ExcludedRow[]
}

function parseDate(val: string): string | null {
  if (!val.trim()) return null
  const d = new Date(val.trim())
  if (isNaN(d.getTime())) return null
  return val.trim()
}

function parseCsv(text: string): string[][] {
  const result: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++ }
      else if (c === '"') inQuotes = false
      else cell += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(cell); cell = '' }
      else if (c === '\n') { row.push(cell); result.push(row); row = []; cell = '' }
      else if (c === '\r') { /* skip */ }
      else cell += c
    }
  }
  if (cell || row.length) { row.push(cell); result.push(row) }
  return result
}

function buildPreview(text: string, existingTasks: Task[]): Preview {
  const lines = parseCsv(text)
  if (lines.length < 2) return { rows: [], excluded: [] }

  const header = lines[0].map(h => h.trim())
  const idx = (name: string) => header.indexOf(name)
  const I = {
    title: idx('제목'), description: idx('설명'), assignee: idx('담당자'),
    status: idx('상태'), progress: idx('진행률'),
    startDate: idx('시작일'), dueDate: idx('목표 기한'), parentTitle: idx('상위 작업 제목'),
  }

  const existingTitleMap = Object.fromEntries(existingTasks.map(t => [t.title, t.id]))
  const rows: ParsedRow[] = []
  const excluded: ExcludedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.every(c => !c.trim())) continue

    const get = (fi: number) => (fi >= 0 ? (line[fi] ?? '').trim() : '')
    const title = get(I.title)

    if (!title) {
      excluded.push({ line: i + 1, reason: '제목 누락' })
      continue
    }

    const warnings: string[] = []
    const rawStart = get(I.startDate)
    const rawDue = get(I.dueDate)
    const startDate = parseDate(rawStart)
    const dueDate = parseDate(rawDue)
    if (rawStart && !startDate) warnings.push('시작일 형식 오류 → 비움')
    if (rawDue && !dueDate) warnings.push('목표 기한 형식 오류 → 비움')

    const rawStatus = get(I.status)
    const status: Status = STATUS_MAP[rawStatus] ?? 'todo'
    if (rawStatus && !STATUS_MAP[rawStatus]) warnings.push(`상태 "${rawStatus}" → 할 일로 대체`)

    const rawProgress = get(I.progress)
    const progress = rawProgress ? Math.min(100, Math.max(0, parseInt(rawProgress, 10) || 0)) : 0
    const parentTitle = get(I.parentTitle) || null
    let parentId: string | null = null

    if (parentTitle) {
      if (existingTitleMap[parentTitle]) {
        parentId = existingTitleMap[parentTitle]
      } else {
        warnings.push(`상위 작업 "${parentTitle}" 매칭 실패 → 최상위로 처리`)
      }
    }

    rows.push({
      title,
      description: get(I.description) || null,
      assignee: get(I.assignee) || null,
      status,
      progress,
      startDate,
      dueDate,
      parentTitle,
      parentId,
      warnings,
    })
  }

  // CSV 내 부모-자식 관계 해결 (existingTasks에 없는 부모가 CSV 안에 있는 경우)
  const csvTitleToIdx: Record<string, number> = {}
  rows.forEach((r, i) => { csvTitleToIdx[r.title] = i })
  rows.forEach(r => {
    if (r.parentTitle && !r.parentId) {
      const csvIdx = csvTitleToIdx[r.parentTitle]
      if (csvIdx !== undefined) {
        r.warnings = r.warnings.filter(w => !w.startsWith('상위 작업'))
      }
    }
  })

  return { rows, excluded }
}

interface Props {
  tasks: Task[]
  onImported: () => void
}

export default function CsvImportButton({ tasks, onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [applying, setApplying] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = (ev.target?.result as string) ?? ''
      setPreview(buildPreview(text, tasks))
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  const handleApply = async () => {
    if (!preview) return
    setApplying(true)

    // 순차 삽입 — 삽입 직후 titleToId를 갱신해 같은 배치 내 자식이 신규 부모를 우선 참조하도록 함
    const titleToId: Record<string, string> = Object.fromEntries(tasks.map(t => [t.title, t.id]))

    for (const row of preview.rows) {
      const parentId = row.parentTitle ? (titleToId[row.parentTitle] ?? null) : null
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: row.title,
          description: row.description,
          assignee: row.assignee,
          status: row.status,
          progress: row.progress,
          startDate: row.startDate,
          dueDate: row.dueDate,
          parentId,
        }),
      })
      if (res.ok) {
        const created = await res.json()
        titleToId[row.title] = created.id  // 이후 행이 이 Task를 부모로 참조 가능
      }
    }

    setApplying(false)
    setPreview(null)
    onImported()
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
      <Button
        onClick={() => fileRef.current?.click()}
        bg="transparent"
        color="#898989"
        border="1px solid #363636"
        borderRadius="6px"
        px={4}
        h="36px"
        fontSize="14px"
        fontWeight={500}
        _hover={{ bg: '#2e2e2e', color: '#fafafa' }}
      >
        CSV 불러오기
      </Button>

      {preview && (
        <>
          <Box position="fixed" inset="0" bg="rgba(0,0,0,0.75)" zIndex={200} onClick={() => setPreview(null)} />
          <Box
            position="fixed" top="50%" left="50%" transform="translate(-50%,-50%)"
            zIndex={201} bg="#171717" border="1px solid #363636" borderRadius="12px"
            p={6} w="520px" maxW="92vw" maxH="80vh" overflowY="auto"
          >
            <Text fontSize="18px" fontWeight={500} color="#fafafa" mb={4}>CSV 가져오기 미리보기</Text>

            <Box bg="rgba(62,207,142,0.08)" border="1px solid rgba(62,207,142,0.25)" borderRadius="8px" p={3} mb={4}>
              <Text fontSize="14px" color="#3ecf8e">
                {preview.rows.length}개 작업을 추가합니다. 제외 {preview.excluded.length}건.
              </Text>
            </Box>

            {preview.rows.map((r, i) => (
              r.warnings.length > 0 && (
                <Box key={i} mb={2} p={3} bg="#1a1a1a" border="1px solid #363636" borderRadius="6px">
                  <Text fontSize="13px" color="#fafafa" mb={1}>{r.title}</Text>
                  {r.warnings.map((w, j) => (
                    <Text key={j} fontSize="12px" color="#f59e0b">⚠ {w}</Text>
                  ))}
                </Box>
              )
            ))}

            {preview.excluded.length > 0 && (
              <Box mb={4}>
                <Text fontSize="13px" color="#898989" mb={2}>제외 항목</Text>
                {preview.excluded.map((e, i) => (
                  <Box key={i} mb={1} p={3} bg="#1a1a1a" border="1px solid rgba(248,113,113,0.3)" borderRadius="6px">
                    <Text fontSize="12px" color="#f87171">{e.line}행: {e.reason}</Text>
                  </Box>
                ))}
              </Box>
            )}

            <Flex justify="flex-end" gap={2} mt={4}>
              <Button
                onClick={() => setPreview(null)}
                bg="transparent" color="#898989" border="1px solid #363636"
                borderRadius="6px" px={5} fontSize="14px" fontWeight={500}
                _hover={{ bg: '#2e2e2e', color: '#fafafa' }}
              >
                취소
              </Button>
              <Button
                onClick={handleApply}
                disabled={applying || preview.rows.length === 0}
                bg="#0f0f0f" color="#fafafa" border="1px solid #fafafa"
                borderRadius="9999px" px={6} fontSize="14px" fontWeight={500}
                _hover={{ opacity: 0.8 }}
                opacity={applying ? 0.5 : 1}
              >
                {applying ? '적용 중...' : '적용'}
              </Button>
            </Flex>
          </Box>
        </>
      )}
    </>
  )
}
