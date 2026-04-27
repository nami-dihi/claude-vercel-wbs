import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

const TaskSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
})

export async function GET() {
  const allTasks = await db.select().from(tasks).orderBy(asc(tasks.createdAt))
  return NextResponse.json(allTasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = TaskSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data
  const [task] = await db.insert(tasks).values({
    title: data.title,
    description: data.description ?? null,
    assignee: data.assignee ?? null,
    status: data.status ?? 'todo',
    progress: data.progress ?? 0,
    startDate: data.startDate ?? null,
    dueDate: data.dueDate ?? null,
    parentId: data.parentId ?? null,
  }).returning()
  return NextResponse.json(task, { status: 201 })
}
