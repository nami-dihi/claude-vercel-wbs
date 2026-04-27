'use client'

import { Box, Flex, Text, Button } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'

interface Props {
  task: Task | null
  childCount?: number
  onClose: () => void
  onConfirm: () => void
}

export default function TaskDeleteDialog({ task, childCount = 0, onClose, onConfirm }: Props) {
  if (!task) return null

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
        w="400px"
        maxW="90vw"
      >
        <Text fontSize="18px" fontWeight={500} color="#fafafa" mb={3}>Task 삭제</Text>
        <Text fontSize="14px" color="#b4b4b4" mb={2}>
          <Box as="span" color="#fafafa" fontWeight={500}>&ldquo;{task.title}&rdquo;</Box>을(를) 삭제하시겠습니까?
        </Text>
        {childCount > 0 && (
          <Text fontSize="13px" color="#f87171" mb={4}>
            하위 Task {childCount}개도 함께 삭제됩니다.
          </Text>
        )}
        <Flex justify="flex-end" gap={2} mt={5}>
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
            onClick={onConfirm}
            bg="rgba(248,113,113,0.1)"
            color="#f87171"
            border="1px solid rgba(248,113,113,0.4)"
            borderRadius="6px"
            px={5}
            fontSize="14px"
            fontWeight={500}
            _hover={{ bg: 'rgba(248,113,113,0.2)' }}
          >
            삭제
          </Button>
        </Flex>
      </Box>
    </>
  )
}
