import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const showCompleted = searchParams.get('showCompleted') === 'true'

  const todos = await prisma.todo.findMany({
    where: showCompleted ? {} : { completed: false },
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
  const { title, description, priority, responsible } = body

  const maxPosition = await prisma.todo.aggregate({
    _max: { position: true },
  })

  const todo = await prisma.todo.create({
    data: {
      title,
      description: description || null,
      priority: priority || 'low',
      responsible: responsible || null,
      position: (maxPosition._max.position ?? -1) + 1,
    },
    include: { comments: true },
  })

  return NextResponse.json(todo, { status: 201 })
}
