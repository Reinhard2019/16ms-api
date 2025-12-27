import { json } from '@solidjs/router';
import { db } from 'src/db';
import { type APIEvent } from '@solidjs/start/server';
import i18next from 'i18next';

export async function GET({ request, params }: APIEvent) {
  const lng = request.headers.get('Accept-Language') ?? undefined;
  const id = params.id;

  const videoToExampleCategory = await db.videoToExampleCategory.findFirst({
    where: { videoId: id },
  });
  const video = videoToExampleCategory && await db.video.findUnique({ where: { id } });

  if (!video) {
    return json({
      code: 404,
      message: i18next.t('Video not found', { lng }),
    });
  }

  return json({
    code: 200,
    data: video,
  });
}
