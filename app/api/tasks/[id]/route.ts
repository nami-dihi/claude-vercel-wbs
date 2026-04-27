import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const [task] = await db.update(tasks).set({
    title: body.title,
    description: body.description ?? null,
    assignee: body.assignee ?? null,
    status: body.status ?? 'todo',
    progress: body.progress ?? 0,
    startDate: body.startDate ?? null,
    dueDate: body.dueDate ?? null,
    parentId: body.parentId ?? null,
    updatedAt: new Date(),
  }).where(eq(tasks.id, id)).returning()
  return NextResponse.json(task)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.delete(tasks).where(eq(tasks.id, id))
  return NextResponse.json({ success: true })
}
