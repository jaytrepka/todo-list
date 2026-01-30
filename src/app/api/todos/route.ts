import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const showCompleted = searchParams.get('showCompleted') === 'true'
  const groupId = searchParams.get('groupId')

  const where: Record<string, unknown> = {}
  if (!showCompleted) where.completed = false
  
  // null means "Common" group, undefined means all groups
  if (groupId === 'common') {
    where.groupId = null
  } else if (groupId) {
    where.groupId = groupId
  }

  const todos = await prisma.todo.findMany({
    where,
    include: { comments: true },
    orderBy: [
      { position: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(todos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, priority, responsible, groupId } = body

  const maxPosition = await prisma.todo.aggregate({
    _max: { position: true },
  })

  const todo = await prisma.todo.create({
    data: {
      title,
      description: description || null,
      priority: priority || 'low',
      responsible: responsible || null,
      groupId: groupId === 'common' ? null : (groupId || null),
      position: (maxPosition._max.position ?? -1) + 1,
    },
    include: { comments: true },
  })

  return NextResponse.json(todo, { status: 201 })
}
