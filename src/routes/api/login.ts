import { type APIEvent } from "@solidjs/start/server";
import { json } from "@solidjs/router";
import jwt from "jsonwebtoken";
import { db } from "src/db";
import { omit } from "lodash-es";
import { nanoid } from "nanoid";
import { isAdmin } from "src/utils";
// import { transporter } from "./send-email";

export interface LoginData {
  /** UserTemp id */
  userTempId: number;
  code: string;
  name?: string;
}

export async function POST({ request }: APIEvent) {
  const { userTempId: id, code, name }: LoginData = await request.json();

  const userTemp = await db.userTemp.findUnique({
    where: {
      id,
    },
  });

  if (!userTemp) {
    return json({
      code: 500,
      message: "验证码已过期，请重新发送验证码",
    });
  }

  if (userTemp.code !== code) {
    return json({
      code: 500,
      message: "验证码错误",
    });
  }

  let user = await db.user.findFirst({ where: { email: userTemp.email } });

  if (!user) {
    if (!name) {
      db.userTemp.update({
        where: {
          id,
        },
        data: {
          verified: true,
        },
      });

      // 超出有效期删除
      setTimeout(async () => {
        await db.userTemp.delete({
          where: {
            id,
          },
        });
      }, 60 * 1e6);

      return json({
        code: 100,
      });
    }

    user = await db.user.create({
      data: {
        id: nanoid(),
        email: userTemp.email,
        name,
      },
    });

    // const users = await db.user.findMany();

    // 通知
    // await transporter.sendMail({
    //   from: process.env.EMAIL_USER,
    //   to: "XNBigDevil@gmail.com",
    //   subject: `当前注册邮件：${userTemp.email}`,
    //   html: `
    // <div style="width:100%;text-align:center;">
    //   <div style="display:inline-block;width:100%;max-width:500px;text-align:center;">
    //     <img src="https://yishun.video/logo.png" width="64px" height="64px" style="padding:18px 18px 15px;" />
    //     <div style="font-family:'Source Sans Pro',sans-serif;font-weight:900;font-size:24px;line-height:32px;padding:10px;">
    //       当前注册邮件：${userTemp.email}
    //       当前用户数量：${users.length}
    //     </div>
    //   </div>
    // </div>
    // `,
    // });
  }

  await db.userTemp.delete({
    where: {
      id,
    },
  });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  return json({
    code: 200,
    data: {
      token,
      user: {
        ...omit(user, ["id", "createdAt", "updatedAt"]),
        isAdmin: isAdmin(user) ? true : undefined,
      },
    },
  });
}
