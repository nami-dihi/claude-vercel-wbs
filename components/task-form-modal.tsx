'use client'

import { useEffect, useState } from 'react'
import { Box, Flex, Text, Button, Input, Textarea } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'

interface FormData {
  title: string
  description: string
  assignee: string
  status: 'todo' | 'doing' | 'done'
  progress: number
  startDate: string
  dueDate: string
}

interface Props {
  isOpen: boolean
  task: Task | null
  parentId?: string | null
  onClose: () => void
  onSubmit: (data: Partial<Task>) => void
}

const EMPTY: FormData = {
  title: '', description: '', assignee: '',
  status: 'todo', progress: 0, startDate: '', dueDate: '',
}

export default function TaskFormModal({ isOpen, task, parentId, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? '',
        assignee: task.assignee ?? '',
        status: task.status as FormData['status'],
        progress: task.progress,
        startDate: task.startDate ?? '',
        dueDate: task.dueDate ?? '',
      })
    } else {
      setForm(EMPTY)
    }
    setError('')
  }, [task, isOpen])

  if (!isOpen) return null

  const set = (k: keyof FormData, v: string | number) =>
    setForm(f => {
      const next = { ...f, [k]: v }
      if (k === 'progress' && Number(v) === 100) next.status = 'done'
      return next
    })

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('제목은 필수입니다.'); return }
    if (form.startDate && form.dueDate && form.dueDate < form.startDate) {
      setError('목표 기한은 시작일보다 이후여야 합니다.'); return
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description || null,
      assignee: form.assignee || null,
      status: form.status,
      progress: form.progress,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
      parentId: task?.parentId ?? parentId ?? null,
    } as Partial<Task>)
  }

  const label = (text: string) => (
    <Text fontSize="13px" color="#b4b4b4" mb={1} fontWeight={500}>{text}</Text>
  )

  const inputStyle = {
    bg: '#0f0f0f',
    border: '1px solid #363636',
    borderRadius: '6px',
    color: '#fafafa',
    fontSize: '14px',
    px: 3,
    py: 2,
    _placeholder: { color: '#4d4d4d' },
    _focus: { borderColor: 'rgba(62,207,142,0.6)', outline: 'none' },
    css: { colorScheme: 'dark' }
  }

  return (
    <>
      <Box position="fixed" inset="0" bg="rgba(0,0,0,0.75)" zIndex={200} onClick={onClose} />
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%,-50%)"
        zIndex={201}
        bg="#171717"
        border="1px solid #363636"
        borderRadius="12px"
        p={6}
        w="480px"
        maxW="92vw"
        maxH="85vh"
        overflowY="auto"
      >
        <Text fontSize="18px" fontWeight={500} color="#fafafa" mb={5}>
          {task ? 'Task 수정' : parentId ? '하위 Task 추가' : 'Task 추가'}
        </Text>

        <Box mb={4}>
          {label('제목 *')}
          <Input {...inputStyle} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task 제목" />
        </Box>

        <Box mb={4}>
          {label('설명')}
          <Textarea {...inputStyle} value={form.description} onChange={e => set('description', e.target.value)} placeholder="선택 사항" rows={3} resize="vertical" />
        </Box>

        <Flex gap={3} mb={4}>
          <Box flex={1}>
            {label('담당자')}
            <Input {...inputStyle} value={form.assignee} onChange={e => set('assignee', e.target.value)} placeholder="이름" />
          </Box>
          <Box flex={1}>
            {label('상태')}
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              style={{
                width: '100%', height: '40px',
                background: '#0f0f0f', color: '#fafafa',
                border: '1px solid #363636', borderRadius: '6px',
                padding: '0 12px', fontSize: '14px',
              }}
            >
              <option value="todo">할 일</option>
              <option value="doing">진행 중</option>
              <option value="done">완료</option>
            </select>
          </Box>
        </Flex>

        <Box mb={4}>
          {label(`진행률: ${form.progress}%`)}
          <Flex align="center" gap={3}>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => set('progress', Number(e.target.value))}
              style={{ flex: 1, accentColor: '#3ecf8e' } as React.CSSProperties}
            />
            <Text fontSize="13px" color="#3ecf8e" w="36px" textAlign="right">{form.progress}%</Text>
          </Flex>
        </Box>

        <Flex gap={3} mb={4}>
          <Box flex={1}>
            {label('시작일')}
            <Input {...inputStyle} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </Box>
          <Box flex={1}>
            {label('목표 기한')}
            <Input {...inputStyle} type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
          </Box>
        </Flex>

        {error && (
          <Text fontSize="13px" color="#f87171" mb={3}>{error}</Text>
        )}

        <Flex justify="flex-end" gap={2} mt={2}>
          <Button
            onClick={onClose}
            bg="transparent"
            color="#898989"
            border="1px solid #363636"
            borderRadius="6px"
            px={5}
            fontSize="14px"
            fontWeight={500}
            _hover={{ bg: '#2e2e2e', color: '#fafafa' }}
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            bg="#0f0f0f"
            color="#fafafa"
            border="1px solid #fafafa"
            borderRadius="9999px"
            px={6}
            fontSize="14px"
            fontWeight={500}
            _hover={{ opacity: 0.8 }}
          >
            {task ? '저장' : '추가'}
          </Button>
        </Flex>
      </Box>
    </>
  )
}
