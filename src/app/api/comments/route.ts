import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { todoId, content, author } = body

  const comment = await prisma.comment.create({
    data: {
      todoId,
      content,
      author: author || null,
    },
  })

  return NextResponse.json(comment, { status: 201 })
}
