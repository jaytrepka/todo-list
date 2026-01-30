import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(groups)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const group = await prisma.group.create({
    data: { name: name.trim() },
  })

  return NextResponse.json(group, { status: 201 })
}
