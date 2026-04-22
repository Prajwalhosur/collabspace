import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const room = await prisma.room.findUnique({
      where: { slug },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const posts = await prisma.post.findMany({
      where: { roomId: room.id },
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true, votes: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ room, posts })
  } catch (error) {
    console.error('Room fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}