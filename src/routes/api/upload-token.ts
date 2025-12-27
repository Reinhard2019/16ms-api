import OSS from 'ali-oss';
import { json } from '@solidjs/router';

const { VITE_ALI_OSS_ACCESS_KEY_ID, VITE_ALI_OSS_ACCESS_KEY_SECRET } =
  import.meta.env;

export async function GET() {
  const sts = new OSS.STS({
    accessKeyId: VITE_ALI_OSS_ACCESS_KEY_ID,
    accessKeySecret: VITE_ALI_OSS_ACCESS_KEY_SECRET,
  });

  const result = await sts.assumeRole(
    'acs:ram::1977849667546115:role/ramosstest',
    '',
    3000
  );

  return json({
    code: 200,
    data: {
      AccessKeyId: result.credentials.AccessKeyId,
      AccessKeySecret: result.credentials.AccessKeySecret,
      SecurityToken: result.credentials.SecurityToken,
      Expiration: result.credentials.Expiration,
    },
  });
}
