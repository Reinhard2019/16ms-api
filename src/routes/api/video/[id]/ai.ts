import { json } from "@solidjs/router";
import { type APIEvent } from "@solidjs/start/server";
import OpenAI from "openai";
import { isEmpty } from "lodash-es";
import { DEEPSEEK_CONFIG } from "src/consts";
import i18next from "i18next";

const openai = new OpenAI(DEEPSEEK_CONFIG);

export async function POST({ request }: APIEvent) {
  const data = await request.json();
  const lng = request.headers.get("Accept-Language") ?? undefined;

  if (isEmpty(data)) {
    return json({
      code: 500,
      message: i18next.t('Parameter cannot be empty', { lng }),
    });
  }

  // 创建流式响应
  const stream = new ReadableStream({
    async start(controller) {
      const completionStream = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: data,
        stream: true,
      });

      for await (const chunk of completionStream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
      }

      controller.enqueue("data: [DONE]\n\n");
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
