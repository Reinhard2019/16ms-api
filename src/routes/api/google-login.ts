import { json } from '@solidjs/router';
import { type APIEvent } from '@solidjs/start/server';
import { OAuth2Client } from 'google-auth-library';
import i18next from 'i18next';

const DATA_CLIENT_ID =
  '662241457252-g8pbhsthho777qnf9vnd4519t1bb2h9p.apps.googleusercontent.com';

const client = new OAuth2Client(DATA_CLIENT_ID);

export async function POST({ request }: APIEvent) {
  const { idToken } = await request.json();

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: DATA_CLIENT_ID,
    });

    const payload = ticket.getPayload()!;

    // 你真正关心的只有这些
    const user = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    };

    // TODO：
    // 1. 查数据库是否存在
    // 2. 不存在就创建用户
    // 3. 生成你自己的 JWT / Session

    return json({ code: 200, user });
  } catch (err) {
    return json({ code: 500, message: i18next.t('Invalid Google token') });
  }
}
