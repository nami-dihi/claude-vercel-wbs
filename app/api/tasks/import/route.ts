import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { tasks } from '@/lib/db/schema'

const RowSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  assignee: z.string().nullable().optional(),
  status: z.enum(['todo', 'doing', 'done']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
})

const ImportSchema = z.object({
  rows: z.array(RowSchema),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = ImportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { rows } = parsed.data
  if (rows.length === 0) {
    return NextResponse.json({ inserted: 0 })
  }
  const inserted = await db.insert(tasks).values(
    rows.map(r => ({
      title: r.title,
      description: r.description ?? null,
      assignee: r.assignee ?? null,
      status: r.status ?? 'todo',
      progress: r.progress ?? 0,
      startDate: r.startDate ?? null,
      dueDate: r.dueDate ?? null,
      parentId: r.parentId ?? null,
    }))
  ).returning()
  return NextResponse.json({ inserted: inserted.length }, { status: 201 })
}
