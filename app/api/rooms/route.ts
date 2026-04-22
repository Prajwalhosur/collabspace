import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import slugify from 'slugify'

const createRoomSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).max(5).default([]),
  isPublic: z.boolean().default(true),
})

export async function GET() {
  const rooms = await prisma.room.findMany({
    where: { isPublic: true },
    include: {
      _count: {
        select: { members: true, posts: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(rooms)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const data = createRoomSchema.parse(body)
  const slug = slugify(data.name, { lower: true, strict: true })

  const existing = await prisma.room.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Room name already taken' }, { status: 400 })
  }

  const room = await prisma.room.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      tags: data.tags,
      isPublic: data.isPublic,
      members: {
        create: {
          userId: session.user.id,
          role: 'ADMIN'
        }
      }
    }
  })

  return NextResponse.json(room, { status: 201 })
}