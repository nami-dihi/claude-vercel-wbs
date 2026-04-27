import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const UpdateSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const body = await request.json()
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data
  const [task] = await db.update(tasks).set({
    title: data.title,
    description: data.description ?? null,
    assignee: data.assignee ?? null,
    status: data.status ?? 'todo',
    progress: data.progress ?? 0,
    startDate: data.startDate ?? null,
    dueDate: data.dueDate ?? null,
    parentId: data.parentId ?? null,
    updatedAt: new Date(),
  }).where(eq(tasks.id, id)).returning()
  if (!task) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json(task)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  await db.delete(tasks).where(eq(tasks.id, id))
  return NextResponse.json({ success: true })
}
