import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { orderedIds } = body

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  await prisma.$transaction(
    orderedIds.map((id: string, index: number) =>
      prisma.todo.update({
        where: { id },
        data: { position: index },
      })
    )
  )

  return NextResponse.json({ success: true })
}
