'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import type { Task } from '@/lib/db/schema'

type TreeNode = Task & { children: TreeNode[] }

interface GanttViewProps {
  rows: Array<{ task: TreeNode; depth: number; hasChildren: boolean }>
  collapsed: Set<string>
  onToggle: (id: string) => void
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === 'done') return false
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) // 'YYYY-MM-DD'
  return task.dueDate < today
}

export default function GanttView({ rows, collapsed, onToggle }: GanttViewProps) {
  // Helper date functions
  const addDays = (date: Date, days: number) => {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }
  
  const startOfWeek = (date: Date) => {
    const result = new Date(date)
    const day = result.getDay()
    const diff = result.getDate() - day
    result.setDate(diff)
    return result
  }
  
  const differenceInDays = (dateLeft: Date, dateRight: Date) => {
    const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }
  
  const isValid = (date: Date) => {
    return !isNaN(date.getTime())
  }
  
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}.${date.getDate()}`
  }

  // 1. Calculate overall grid date range
  const dates = rows.flatMap(r => {
    const d = []
    if (r.task.startDate) {
      const start = new Date(r.task.startDate)
      if (isValid(start)) d.push(start)
    }
    if (r.task.dueDate) {
      const due = new Date(r.task.dueDate)
      if (isValid(due)) d.push(due)
    }
    return d
  })

  let minDate = new Date()
  let maxDate = addDays(new Date(), 30)

  if (dates.length > 0) {
    minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  }

  // Pad to start of week, minus 1 week, plus 2 weeks
  minDate = addDays(startOfWeek(minDate), -7)
  maxDate = addDays(maxDate, 14)

  const totalDays = differenceInDays(maxDate, minDate) + 1

  // Generate weeks
  const weeks: Date[] = []
  let curr = new Date(minDate)
  while (curr <= maxDate) {
    weeks.push(curr)
    curr = addDays(curr, 7)
  }

  // Helper to calculate percentage position
  const getLeftPercent = (date: Date) => {
    const diff = differenceInDays(date, minDate)
    return Math.max(0, Math.min(100, (diff / totalDays) * 100))
  }

  const getWidthPercent = (start: Date, end: Date) => {
    const diff = differenceInDays(end, start) + 1
    return Math.max(0, Math.min(100, (diff / totalDays) * 100))
  }

  const today = new Date()
  const todayLeft = getLeftPercent(today)
  const isTodayInRange = today >= minDate && today <= maxDate

  return (
    <Box border="1px solid #2e2e2e" borderRadius="8px" overflow="hidden" bg="#171717">
      <Flex borderBottom="1px solid #242424">
        {/* Header Left (Task Tree) */}
        <Box w="300px" flexShrink={0} borderRight="1px solid #2e2e2e" p={3}>
          <Text fontSize="12px" color="#4d4d4d" fontWeight={500} textTransform="uppercase" letterSpacing="0.05em">
            작업명
          </Text>
        </Box>

        {/* Header Right (Date Grid) */}
        <Box flex={1} overflowX="auto" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
          <Box position="relative" minW="800px" h="100%">
            {/* Week Labels */}
            <Flex position="absolute" top={0} left={0} right={0} bottom={0}>
              {weeks.map((week, i) => (
                <Box
                  key={i}
                  position="absolute"
                  left={`${getLeftPercent(week)}%`}
                  h="100%"
                  borderLeft="1px solid #242424"
                  px={2}
                  pt={3}
                >
                  <Text fontSize="12px" color="#898989">
                    {formatDate(week)}
                  </Text>
                </Box>
              ))}
            </Flex>
          </Box>
        </Box>
      </Flex>

      {/* Body */}
      <Flex>
        {/* Body Left (Task Tree) */}
        <Box w="300px" flexShrink={0} borderRight="1px solid #2e2e2e">
          {rows.map(({ task, depth, hasChildren }, i) => {
            const isLast = i === rows.length - 1
            const isColl = collapsed.has(task.id)

            return (
              <Flex
                key={task.id}
                align="center"
                h="40px"
                px={3}
                borderBottom={isLast ? 'none' : '1px solid #242424'}
                cursor={hasChildren ? 'pointer' : 'default'}
                onClick={() => hasChildren && onToggle(task.id)}
                _hover={{ bg: '#1f1f1f' }}
              >
                <Box w={`${depth * 16}px`} flexShrink={0} />
                <Box w="16px" mr={1} display="flex" alignItems="center" justifyContent="center">
                  {hasChildren ? (
                    <Box
                      fontSize="10px"
                      color="#898989"
                      lineHeight={1}
                      userSelect="none"
                    >
                      {isColl ? '▶' : '▼'}
                    </Box>
                  ) : null}
                </Box>
                <Text
                  fontSize="13px"
                  color="#fafafa"
                  lineClamp={1}
                  userSelect="none"
                  fontWeight={hasChildren ? 500 : 400}
                >
                  {task.title}
                </Text>
              </Flex>
            )
          })}
        </Box>

        {/* Body Right (Date Grid) */}
        <Box flex={1} overflowX="auto">
          <Box position="relative" minW="800px" h="100%">
            {/* Background Grid Lines */}
            <Flex position="absolute" top={0} left={0} right={0} bottom={0} pointerEvents="none">
              {weeks.map((week, i) => (
                <Box
                  key={i}
                  position="absolute"
                  left={`${getLeftPercent(week)}%`}
                  h="100%"
                  borderLeft="1px solid #242424"
                />
              ))}
              {/* Today Line */}
              {isTodayInRange && (
                <Box
                  position="absolute"
                  left={`${todayLeft}%`}
                  top={0}
                  bottom={0}
                  w="1px"
                  bg="rgba(62, 207, 142, 0.4)"
                  zIndex={1}
                />
              )}
            </Flex>

            {/* Task Bars */}
            {rows.map(({ task }, i) => {
              const isLast = i === rows.length - 1

              const hasStart = task.startDate && isValid(new Date(task.startDate))
              const hasDue = task.dueDate && isValid(new Date(task.dueDate))

              const startDate = hasStart ? new Date(task.startDate!) : null
              const dueDate = hasDue ? new Date(task.dueDate!) : null
              const overdue = isOverdue(task)

              let barContent = null

              if (!startDate || !dueDate) {
                barContent = (
                  <Text fontSize="12px" color="#4d4d4d" fontStyle="italic">
                    — 일정 없음 —
                  </Text>
                )
              } else {
                const leftP = getLeftPercent(startDate)
                const widthP = getWidthPercent(startDate, dueDate)

                barContent = (
                  <Box
                    position="absolute"
                    left={`${leftP}%`}
                    w={`${widthP}%`}
                    h="20px"
                    bg="#2e2e2e"
                    borderRadius="4px"
                    overflow="hidden"
                    border={overdue ? '2px solid #f87171' : 'none'}
                  >
                    <Box
                      h="100%"
                      w={`${task.progress}%`}
                      bg={overdue ? '#f87171' : '#3ecf8e'}
                      opacity={0.8}
                    />
                    {overdue && (
                      <Box
                        position="absolute"
                        inset={0}
                        pointerEvents="none"
                        style={{
                          background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(248,113,113,0.15) 4px, rgba(248,113,113,0.15) 8px)',
                        }}
                      />
                    )}
                  </Box>
                )
              }

              return (
                <Flex
                  key={task.id}
                  align="center"
                  h="40px"
                  px={3}
                  borderBottom={isLast ? 'none' : '1px solid #242424'}
                  position="relative"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.02)' }}
                >
                  {barContent}
                </Flex>
              )
            })}
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}
