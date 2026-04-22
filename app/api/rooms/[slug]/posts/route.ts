import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await req.json()
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }

    const room = await prisma.room.findUnique({
      where: { slug }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const post = await prisma.post.create({
      data: {
        content,
        authorId: session.user.id,
        roomId: room.id,
      },
      include: {
        author: { select: { name: true, image: true } },
        _count: { select: { comments: true, votes: true } }
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Post create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}