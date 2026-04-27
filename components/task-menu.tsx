'use client'

import { useState, useRef, useEffect } from 'react'
import { Box } from '@chakra-ui/react'

interface Props {
  onEdit: () => void
  onDelete: () => void
  onAddSubtask?: () => void
}

export default function TaskMenu({ onEdit, onDelete, onAddSubtask }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const item = (label: string, onClick: () => void, danger?: boolean) => (
    <Box
      as="button"
      display="block"
      w="100%"
      textAlign="left"
      px={4}
      py="8px"
      fontSize="14px"
      color={danger ? '#f87171' : '#fafafa'}
      bg="transparent"
      border="none"
      cursor="pointer"
      _hover={{ bg: '#2e2e2e' }}
      onClick={() => { onClick(); setOpen(false) }}
    >
      {label}
    </Box>
  )

  return (
    <Box ref={ref} position="relative">
      <Box
        as="button"
        w="28px"
        h="28px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="6px"
        border="1px solid transparent"
        color="#898989"
        bg="transparent"
        cursor="pointer"
        fontSize="16px"
        _hover={{ bg: '#2e2e2e', color: '#fafafa', borderColor: '#363636' }}
        onClick={() => setOpen(v => !v)}
      >
        ⋯
      </Box>
      {open && (
        <Box
          position="absolute"
          right={0}
          top="32px"
          zIndex={100}
          bg="#1a1a1a"
          border="1px solid #363636"
          borderRadius="8px"
          minW="140px"
          overflow="hidden"
          boxShadow="0 4px 12px rgba(0,0,0,0.4)"
        >
          {item('수정', onEdit)}
          {onAddSubtask && item('하위 Task 추가', onAddSubtask)}
          {item('삭제', onDelete, true)}
        </Box>
      )}
    </Box>
  )
}
