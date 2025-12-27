import { json } from '@solidjs/router'
import { type APIEvent } from '@solidjs/start/server'
import { db } from 'src/db'

export async function DELETE({ params }: APIEvent) {
  const id = params.id
  const assetId = params.assetId

  const video = await db.video.findUnique({ where: { id } })

  await db.video.update({
    where: {
      id,
    },
    data: {
      assets: (video?.assets as Array<{ id: string }>).filter(v => v.id !== assetId),
    },
  })

  return json({ code: 200 })
}
