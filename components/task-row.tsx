'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'
import StatusBadge from './status-badge'
import TaskMenu from './task-menu'

interface Props {
  task: Task
  depth?: number
  isLast?: boolean
  onEdit: () => void
  onDelete: () => void
  onStatusCycle: () => void
  onAddSubtask?: () => void
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === 'done') return false
  return new Date(task.dueDate) < new Date(new Date().toDateString())
}

export default function TaskRow({ task, depth = 0, isLast, onEdit, onDelete, onStatusCycle, onAddSubtask }: Props) {
  const overdue = isOverdue(task)

  return (
    <Box
      borderBottom={isLast ? 'none' : '1px solid #242424'}
      _hover={{ bg: 'rgba(255,255,255,0.02)' }}
      transition="background 0.1s"
    >
      <Flex
        align="center"
        px={4}
        py={3}
        gap={3}
        pl={`${16 + depth * 24}px`}
      >
        {/* 제목 */}
        <Box flex={1} minW={0}>
          <Text
            fontSize="14px"
            color="#fafafa"
            fontWeight={400}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            cursor="pointer"
            _hover={{ color: '#3ecf8e' }}
            onClick={onEdit}
          >
            {task.title}
          </Text>
          {task.assignee && (
            <Text fontSize="12px" color="#898989" mt="2px">{task.assignee}</Text>
          )}
        </Box>

        {/* 진행률 */}
        <Flex align="center" gap={2} w="80px" flexShrink={0}>
          <Box flex={1} h="4px" bg="#2e2e2e" borderRadius="9999px" overflow="hidden">
            <Box
              h="100%"
              w={`${task.progress}%`}
              bg={task.progress === 100 ? '#3ecf8e' : '#8b9cf4'}
              borderRadius="9999px"
              transition="width 0.2s"
            />
          </Box>
          <Text fontSize="11px" color="#898989" w="28px" textAlign="right">
            {task.progress}%
          </Text>
        </Flex>

        {/* 상태 */}
        <Box flexShrink={0}>
          <StatusBadge status={task.status as 'todo' | 'doing' | 'done'} onClick={onStatusCycle} />
        </Box>

        {/* 날짜 */}
        <Box w="100px" flexShrink={0} display={{ base: 'none', md: 'block' }}>
          {task.dueDate ? (
            <Text
              fontSize="12px"
              color={overdue ? '#f87171' : '#898989'}
              fontWeight={overdue ? 500 : 400}
            >
              {overdue && <Box as="span" mr={1}>⚠</Box>}
              {task.dueDate}
            </Text>
          ) : (
            <Text fontSize="12px" color="#434343">—</Text>
          )}
        </Box>

        {/* 메뉴 */}
        <Box flexShrink={0}>
          <TaskMenu onEdit={onEdit} onDelete={onDelete} onAddSubtask={onAddSubtask} />
        </Box>
      </Flex>
    </Box>
  )
}
