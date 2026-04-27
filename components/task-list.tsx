'use client'

import { useState, useEffect, useCallback } from 'react'
import { Box, Flex, Text, Button, Heading } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'
import TaskRow from './task-row'
import TaskFormModal from './task-form-modal'
import TaskDeleteDialog from './task-delete-dialog'

const NEXT_STATUS: Record<string, 'todo' | 'doing' | 'done'> = {
  todo: 'doing', doing: 'done', done: 'todo',
}

function countChildren(tasks: Task[], parentId: string): number {
  return tasks.reduce((acc, t) => {
    if (t.parentId === parentId) return acc + 1 + countChildren(tasks, t.id)
    return acc
  }, 0)
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newParentId, setNewParentId] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks')
    setTasks(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleCreate = async (data: Partial<Task>) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchTasks()
    setIsCreateOpen(false)
    setNewParentId(null)
  }

  const handleUpdate = async (id: string, data: Partial<Task>) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await fetchTasks()
    setEditingTask(null)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    await fetchTasks()
    setDeletingTask(null)
  }

  const handleStatusCycle = (task: Task) => {
    handleUpdate(task.id, { ...task, status: NEXT_STATUS[task.status] })
  }

  const openAddSubtask = (parentId: string) => {
    setNewParentId(parentId)
    setIsCreateOpen(true)
  }

  const isModalOpen = isCreateOpen || editingTask !== null

  return (
    <Box minH="100vh" bg="#171717" p={{ base: 4, md: 8 }}>
      <Box maxW="1000px" mx="auto">

        {/* 헤더 */}
        <Flex justify="space-between" align="center" mb={8}>
          <Box>
            <Heading fontSize="28px" fontWeight={400} color="#fafafa" lineHeight={1.2}>
              WBS Manager
            </Heading>
            <Text fontSize="14px" color="#898989" mt={1}>
              {tasks.length}개의 Task
            </Text>
          </Box>
          <Button
            onClick={() => { setNewParentId(null); setIsCreateOpen(true) }}
            bg="#0f0f0f"
            color="#fafafa"
            border="1px solid #fafafa"
            borderRadius="9999px"
            px={6}
            h="36px"
            fontSize="14px"
            fontWeight={500}
            _hover={{ opacity: 0.8 }}
          >
            + Task 추가
          </Button>
        </Flex>

        {/* 컬럼 헤더 */}
        {tasks.length > 0 && (
          <Flex
            px={4}
            pb={2}
            mb={1}
            fontSize="12px"
            color="#4d4d4d"
            fontWeight={500}
            borderBottom="1px solid #242424"
            style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            <Box flex={1}>제목</Box>
            <Box w="80px" flexShrink={0}>진행률</Box>
            <Box w="72px" flexShrink={0} ml={3}>상태</Box>
            <Box w="100px" flexShrink={0} display={{ base: 'none', md: 'block' }}>목표 기한</Box>
            <Box w="28px" flexShrink={0} />
          </Flex>
        )}

        {/* Task 목록 */}
        {loading ? (
          <Box textAlign="center" py={16}>
            <Text color="#898989" fontSize="14px">로딩 중...</Text>
          </Box>
        ) : tasks.length === 0 ? (
          <Box
            border="1px solid #2e2e2e"
            borderRadius="8px"
            py={16}
            textAlign="center"
          >
            <Text color="#898989" fontSize="14px" mb={2}>아직 Task가 없습니다.</Text>
            <Text color="#4d4d4d" fontSize="13px">상단의 &ldquo;+ Task 추가&rdquo; 버튼으로 첫 Task를 만들어 보세요.</Text>
          </Box>
        ) : (
          <Box border="1px solid #2e2e2e" borderRadius="8px" overflow="hidden">
            {tasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                isLast={i === tasks.length - 1}
                onEdit={() => setEditingTask(task)}
                onDelete={() => setDeletingTask(task)}
                onStatusCycle={() => handleStatusCycle(task)}
                onAddSubtask={() => openAddSubtask(task.id)}
              />
            ))}
          </Box>
        )}
      </Box>

      <TaskFormModal
        isOpen={isModalOpen}
        task={editingTask}
        parentId={newParentId}
        onClose={() => { setIsCreateOpen(false); setEditingTask(null); setNewParentId(null) }}
        onSubmit={(data) => editingTask ? handleUpdate(editingTask.id, data) : handleCreate(data)}
      />

      <TaskDeleteDialog
        task={deletingTask}
        childCount={deletingTask ? countChildren(tasks, deletingTask.id) : 0}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => deletingTask && handleDelete(deletingTask.id)}
      />
    </Box>
  )
}
