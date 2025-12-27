import { json } from "@solidjs/router";
import { type APIEvent } from "@solidjs/start/server";
import i18next from "i18next";
import { customAlphabet } from "nanoid";
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { db } from "src/db";
import { getDefaultLang } from "src/i18n";

const transporter = nodemailer.createTransport({
  host: "smtp.feishu.cn",
  port: 465,
  secure: true, // 使用 SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface SendEmailData {
  email: string;
  /** 测试模式，开启后不发送邮件，而是在 response 中返回（仅限白名单中的邮箱可用） */
  test?: boolean;
}

const nanoid = customAlphabet("1234567890", 6);

export async function POST({ request }: APIEvent) {
  const { email, test }: SendEmailData = await request.json();
  const lng = request.headers.get("Accept-Language") ?? undefined;

  // const user = await db.userTemp.findFirst({
  //   where: {
  //     email,
  //   },
  // });

  // console.log("email", user, email);

  // if (!user) {
  //   return json({
  //     code: 500,
  //     message: "该邮箱暂时不能注册",
  //   });
  // }

  const verifyCode = nanoid();

  const userTemp = await db.userTemp.create({
    data: {
      email,
      code: verifyCode,
    },
  });

  // 超出有效期删除 code
  setTimeout(async () => {
    const newUserTemp = await db.userTemp.findUnique({
      where: {
        id: userTemp.id,
      },
    });

    if (newUserTemp?.verified) return;

    await db.userTemp.delete({
      where: {
        id: userTemp.id,
      },
    });
  }, 10 * 1e6);

  if (test) {
    return json({
      code: 200,
      data: {
        tempId: userTemp.id,
        code: verifyCode,
      },
    });
  }

  const mailOptions: Mail.Options = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${i18next.t("Your login verification code", { lng })}：${verifyCode}`,
    html: `
    <div style="width:100%;text-align:center;">
      <div style="display:inline-block;width:100%;max-width:500px;text-align:center;">
        <img src="https://yishun-user.oss-cn-shanghai.aliyuncs.com/public/logo.png" width="64px" height="64px" style="padding:18px 18px 15px;" />
        <div style="font-family:'Source Sans Pro',sans-serif;font-weight:900;font-size:24px;line-height:32px;padding:10px;">
          ${i18next.t("email.Your login verification code", { lng })}
        </div>
        <div style="font-family:'Source Sans Pro',sans-serif;font-size:16px;line-height:24px;text-align:center;padding:13px 30px 30px;">
          ${i18next.t("email.copy and paste", { lng })}
        </div>
        <div style="padding:10px 32px;">
          <div style="font-family:monaco;font-size:20px;font-weight:400;border-radius:16px;background:#e3e3e3;text-align:center;padding:50px;">
            <strong>${verifyCode}</strong>
          </div>
        </div>
        <div style="padding:25px 48px;font-family:'Source Sans Pro',sans-serif;font-size:14px;">
          ${i18next.t("email.ignore this email", { lng })}
        </div>
      </div>
    </div>
    `,
  };

  await transporter.sendMail(mailOptions);

  return json({
    code: 200,
    data: {
      tempId: userTemp.id,
    },
  });
}
