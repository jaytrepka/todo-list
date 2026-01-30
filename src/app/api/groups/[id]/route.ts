import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, color } = body

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (color !== undefined) updateData.color = color

  const group = await prisma.group.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json(group)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // Move todos to no group before deleting
  await prisma.todo.updateMany({
    where: { groupId: id },
    data: { groupId: null },
  })
  
  await prisma.group.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
