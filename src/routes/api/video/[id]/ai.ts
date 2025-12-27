import { json } from "@solidjs/router";
import { type APIEvent } from "@solidjs/start/server";
import OpenAI from "openai";
import { isEmpty } from "lodash-es";
import { DEEPSEEK_CONFIG } from "src/consts";

const openai = new OpenAI(DEEPSEEK_CONFIG);

export async function POST({ request }: APIEvent) {
  const data = await request.json();
  // const id = Number(params.id)

  if (isEmpty(data)) {
    return json({
      code: 500,
      message: "传参不能为空",
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

  // const completion = await openai.chat.completions.create({
  //   messages: data,
  //   model: 'deepseek-chat',
  //   stream: true,
  // })

  // return json({
  //   code: 200,
  //   data: completion.choices[0].message,
  // })
}
