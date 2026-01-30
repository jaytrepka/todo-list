import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const todo = await prisma.todo.findUnique({
    where: { id },
    include: { comments: true },
  })

  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
  }

  return NextResponse.json(todo)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { title, description, priority, completed, responsible } = body

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (priority !== undefined) updateData.priority = priority
  if (responsible !== undefined) updateData.responsible = responsible
  if (completed !== undefined) {
    updateData.completed = completed
    updateData.solvedAt = completed ? new Date() : null
  }

  const todo = await prisma.todo.update({
    where: { id },
    data: updateData,
    include: { comments: true },
  })

  return NextResponse.json(todo)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.todo.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
