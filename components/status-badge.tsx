'use client'

import type { MouseEvent } from 'react'
import { Box } from '@chakra-ui/react'

type Status = 'todo' | 'doing' | 'done'

const LABEL: Record<Status, string> = {
  todo: '할 일',
  doing: '진행 중',
  done: '완료',
}

const STYLE: Record<Status, { bg: string; color: string; border: string }> = {
  todo:  { bg: 'rgba(137,137,137,0.15)', color: '#898989', border: '1px solid #434343' },
  doing: { bg: 'rgba(99,119,217,0.15)',  color: '#8b9cf4', border: '1px solid #4a55a2' },
  done:  { bg: 'rgba(62,207,142,0.15)',  color: '#3ecf8e', border: '1px solid #1e7a52' },
}

interface Props {
  status: Status
  onClick?: (e: MouseEvent) => void
}

export default function StatusBadge({ status, onClick }: Props) {
  const s = STYLE[status] ?? STYLE.todo
  return (
    <Box
      as={onClick ? 'button' : 'span'}
      onClick={onClick}
      display="inline-flex"
      alignItems="center"
      px="8px"
      py="2px"
      borderRadius="9999px"
      fontSize="12px"
      fontWeight={500}
      bg={s.bg}
      color={s.color}
      border={s.border}
      cursor={onClick ? 'pointer' : 'default'}
      whiteSpace="nowrap"
      _hover={onClick ? { opacity: 0.8 } : undefined}
      userSelect="none"
    >
      {LABEL[status] ?? status}
    </Box>
  )
}
