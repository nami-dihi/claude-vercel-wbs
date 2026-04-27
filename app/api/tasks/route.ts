import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export async function GET() {
  const allTasks = await db.select().from(tasks).orderBy(asc(tasks.createdAt))
  return NextResponse.json(allTasks)
}

export async function POST(request: Request) {
  const body = await request.json()
  const [task] = await db.insert(tasks).values({
    title: body.title,
    description: body.description ?? null,
    assignee: body.assignee ?? null,
    status: body.status ?? 'todo',
    progress: body.progress ?? 0,
    startDate: body.startDate ?? null,
    dueDate: body.dueDate ?? null,
    parentId: body.parentId ?? null,
  }).returning()
  return NextResponse.json(task, { status: 201 })
}
