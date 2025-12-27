import { isEmpty } from 'lodash-es';
import { json } from '@solidjs/router';
import { db } from 'src/db';
import { type APIEvent } from '@solidjs/start/server';
import i18next from 'i18next';

export async function GET({ request, params, locals }: APIEvent) {
  const lng = request.headers.get('Accept-Language') ?? undefined;
  const userId = locals.userId;
  const id = params.id;
  let video = await db.video.findUnique({ where: { id, userId } });

  if (!video) {
    const videoToExampleCategory = await db.videoToExampleCategory.findFirst({
      where: { videoId: id },
    });
    // 是否公开
    if (videoToExampleCategory) {
      video = await db.video.findUnique({ where: { id } });
    }
  }

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

export async function POST({ params, request, locals }: APIEvent) {
  const lng = request.headers.get('Accept-Language') ?? undefined;
  const userId = locals.userId;
  const data = await request.json();
  const id = params.id;

  if (isEmpty(data)) {
    return json({
      code: 500,
      message: i18next.t('Parameter cannot be empty', { lng }),
    });
  }

  if (typeof data.updatedAt === 'number') {
    const video = await db.video.findUnique({ where: { id, userId } });

    if (!video) {
      return json({
        code: 404,
        message: i18next.t('Video not found', { lng }),
      });
    }

    // 如果数据库中的更新时间更大，则直接返回数据库中的数据
    if (video && video.updatedAt.getTime() > data.updatedAt) {
      return json({
        code: 200,
        data: video,
      });
    }

    delete data.updatedAt;
  }

  try {
    const video = await db.video.update({
      where: {
        id,
        userId,
      },
      data,
    });

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
  } catch (err) {
    console.log('err', err);
  }
}

export async function DELETE({ params, locals }: APIEvent) {
  const userId = locals.userId;
  const id = params.id;

  await db.video.delete({ where: { id, userId } });

  return json({ code: 200 });
}
