import { json } from '@solidjs/router'
import { type APIEvent } from '@solidjs/start/server'
import { nanoid } from 'nanoid'
import { db } from 'src/db'

export async function GET({ locals }: APIEvent) {
  const userId = locals.userId

  const videos = await db.video.findMany({
    where: {
      userId,
    },
    include: {},
    orderBy: {
      createdAt: 'desc',
    },
  })
  return json({
    code: 200,
    data: {
      list: videos,
      count: videos.length,
    },
  })
}

export async function POST({ request, locals }: APIEvent) {
  const userId = locals.userId
  const data = await request.json()

  try {
    const video = await db.video.create({
      data: {
        ...data,
        userId,
        id: nanoid(),
      },
    })

    return json({
      code: 200,
      data: video,
    })
  } catch (err) {
    const error = new Error('')
    // @ts-expect-error msg
    error.msg = err.message
    throw error
  }
}
