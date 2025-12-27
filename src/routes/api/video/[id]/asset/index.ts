import { json } from '@solidjs/router'
import { type APIEvent } from '@solidjs/start/server'
import { db } from 'src/db'

export async function POST({ params, request }: APIEvent) {
  const data = await request.json()
  const id = params.id

  const video = await db.video.findUnique({ where: { id } })

  await db.video.update({
    where: {
      id,
    },
    data: {
      assets: [...((video?.assets as []) ?? []), data],
    },
  })

  return json({
    code: 200,
  })
}
