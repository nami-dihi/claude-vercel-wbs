'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'
import StatusBadge from './status-badge'
import TaskMenu from './task-menu'

interface Props {
  task: Task
  depth?: number
  hasChildren?: boolean
  isCollapsed?: boolean
  isFirst?: boolean
  isLast?: boolean
  onToggle?: () => void
  onEdit: () => void
  onDelete: () => void
  onStatusCycle: () => void
  onAddSubtask?: () => void
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === 'done') return false
  const today = new Date().toLocaleDateString('en-CA') // 'YYYY-MM-DD'
  return task.dueDate < today
}

export default function TaskRow({ task, depth = 0, hasChildren, isCollapsed, isFirst, isLast, onToggle, onEdit, onDelete, onStatusCycle, onAddSubtask }: Props) {
  const overdue = isOverdue(task)

  return (
    <Box
      borderBottom={isLast ? 'none' : '1px solid #242424'}
      borderTopRadius={isFirst ? '8px' : '0'}
      borderBottomRadius={isLast ? '8px' : '0'}
      _hover={{ bg: 'rgba(255,255,255,0.02)' }}
      transition="background 0.1s"
      onClick={onEdit}
      cursor="pointer"
      role="group"
    >
      <Flex
        align="center"
        px={4}
        py={3}
        gap={3}
      >
        {/* 접기/펼치기 토글 */}
        <Box w="16px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" ml={`${depth * 24}px`}>
          {hasChildren ? (
            <Box
              as="button"
              onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
              fontSize="10px"
              color="#898989"
              cursor="pointer"
              bg="transparent"
              border="none"
              p={0}
              lineHeight={1}
              _hover={{ color: '#fafafa' }}
              userSelect="none"
            >
              {isCollapsed ? '▶' : '▼'}
            </Box>
          ) : null}
        </Box>

        {/* 제목 */}
        <Box flex={1} minW={0}>
          <Text
            fontSize="14px"
            color="#fafafa"
            fontWeight={400}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            transition="color 0.1s"
            _groupHover={{ color: '#3ecf8e' }}
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
          <Text fontSize="11px" color="#898989" w="32px" textAlign="left" whiteSpace="nowrap">
            {task.progress}%
          </Text>
        </Flex>

        {/* 상태 */}
        <Box w="72px" flexShrink={0}>
          <StatusBadge status={task.status as 'todo' | 'doing' | 'done'} onClick={(e) => { e.stopPropagation(); onStatusCycle(); }} />
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
        <Box w="28px" flexShrink={0} display="flex" justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
          <TaskMenu onEdit={onEdit} onDelete={onDelete} onAddSubtask={onAddSubtask} />
        </Box>
      </Flex>
    </Box>
  )
}
