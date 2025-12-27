import { createMiddleware } from "@solidjs/start/middleware";
import { getCookie, setCookie } from "vinxi/http";
import jwt from "jsonwebtoken";
import { json } from "@solidjs/router";
import { db } from "src/db";
import url from "url";
import { omit } from "lodash-es";
import "src/server-i18n";
import i18next from "i18next";
import { defaultLang } from "./i18n";

process.env.JWT_SECRET = "giSwif-nehwac-fazhi1";

process.env.EMAIL_USER = "noreply@yishun.video";
process.env.EMAIL_PASS = "BW2nInpYyZx4KrHp";

const needAuth = (pathname: string) => {
  if (!pathname.startsWith("/api/")) return false;

  if (pathname === "/api/examples") return false;
  if (pathname === "/api/login") return false;
  if (pathname === "/api/send-email") return false;
  if (pathname === "/api/git-year") return false;
  if (pathname.startsWith("/api/video/public/")) return false;

  return true;
};

export default createMiddleware({
  onRequest: [
    // auth
    async ({ request, locals }) => {
      const lang = getCookie("lang") ?? defaultLang;
      i18next.changeLanguage(lang);

      const parsed = new url.URL(request.url);

      if (!needAuth(parsed.pathname)) return;

      const params = new URLSearchParams(parsed.search);

      const token =
        params.get("token") ??
        request.headers.get("Authorization")?.replace("Bearer ", "");
      if (!token)
        return json({
          code: 401,
        });

      try {
        const verified = jwt.verify(token, process.env.JWT_SECRET!);
        if (typeof verified !== "object" || typeof verified.id !== "string")
          return json({
            code: 401,
          });

        const user = await db.user.findUnique({
          where: {
            id: verified.id,
          },
        });
        if (!user)
          return json({
            code: 401,
          });

        locals.userId = user.id;
        locals.user = user;
        setCookie(
          "user",
          JSON.stringify(omit(user, ["id", "createdAt", "updatedAt"])),
        );
      } catch (err) {
        return json({
          code: 401,
        });
      }
    },
  ],
  onBeforeResponse: [],
});
