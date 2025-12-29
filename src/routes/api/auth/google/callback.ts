import { json } from '@solidjs/router';
import { type APIEvent } from '@solidjs/start/server';
import { OAuth2Client } from 'google-auth-library';
import i18next from 'i18next';

const GOOGLE_CLIENT_ID = '';
const GOOGLE_CLIENT_SECRET = '';

// const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function GET({ request }: APIEvent) {
  // console.log('url', request.url)

  const parsedUrl = new URL(request.url);
  const params = Object.fromEntries(parsedUrl.searchParams.entries());

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: params.code,
      grant_type: 'authorization_code',
      redirect_uri: 'https://16ms.ai/auth/google/callback',
    }),
  });

  const data = await res.json();

  return json(data);
  // const { idToken } = await request.json();

  // try {
  //   const ticket = await client.verifyIdToken({
  //     idToken,
  //     audience: DATA_CLIENT_ID,
  //   });

  //   const payload = ticket.getPayload()!;

  //   // 你真正关心的只有这些
  //   const user = {
  //     googleId: payload.sub,
  //     email: payload.email,
  //     name: payload.name,
  //     avatar: payload.picture,
  //   };

  //   // TODO：
  //   // 1. 查数据库是否存在
  //   // 2. 不存在就创建用户
  //   // 3. 生成你自己的 JWT / Session

  //   return json({ code: 200, user });
  // } catch (err) {
  //   return json({ code: 500, message: i18next.t('Invalid Google token') });
  // }
}
