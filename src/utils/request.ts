import { message } from "antd-solid";
import { getLng } from "src/i18n";
import { BaseResponse } from "src/types";

export default async function request<T = any>(
  url: string,
  options?: { method?: string; body?: any },
) {
  return await fetch(url, {
    method: options?.method,
    body: options?.body && JSON.stringify(options?.body),
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": getLng(),
    },
  })
    .catch((err) => {
      message.error("网络请求出现错误");
      throw err;
    })
    .then(async (resp) => {
      if (resp.status !== 200) {
        message.error("网络请求出现错误");
        throw new Error(resp.statusText);
      }

      if (resp.headers.get("Content-Type") === "text/event-stream") {
        if (!resp.body) {
          throw new Error("No response body");
        }
        return resp.body.getReader();
      }

      const data: BaseResponse<T> = await resp.json();

      return data;
    });
}
