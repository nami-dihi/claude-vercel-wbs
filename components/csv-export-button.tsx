'use client'

import { Button } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'

const HEADERS = ['제목', '설명', '담당자', '상태', '진행률', '시작일', '목표 기한', '상위 작업 제목']

function escapeCell(v: string | null | undefined): string {
  const s = v ?? ''
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function statusLabel(s: string): string {
  return s === 'done' ? '완료' : s === 'doing' ? '진행 중' : '할 일'
}

interface Props {
  tasks: Task[]
}

export default function CsvExportButton({ tasks }: Props) {
  const handleExport = () => {
    const idToTitle = Object.fromEntries(tasks.map(t => [t.id, t.title]))

    const rows = tasks.map(t => [
      escapeCell(t.title),
      escapeCell(t.description),
      escapeCell(t.assignee),
      escapeCell(statusLabel(t.status)),
      String(t.progress),
      escapeCell(t.startDate),
      escapeCell(t.dueDate),
      escapeCell(t.parentId ? idToTitle[t.parentId] : ''),
    ])

    const csv = [HEADERS.join(','), ...rows.map(r => r.join(','))].join('\n')
    const date = new Date().toLocaleDateString('en-CA')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wbs-${date}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      onClick={handleExport}
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
      CSV 내보내기
    </Button>
  )
}
