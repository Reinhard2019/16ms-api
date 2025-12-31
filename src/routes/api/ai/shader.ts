import { json } from '@solidjs/router';
import { type APIEvent } from '@solidjs/start/server';
import OpenAI from 'openai';
import { isEmpty } from 'lodash-es';
import { DEEPSEEK_CONFIG } from 'src/consts';
import i18next from 'i18next';

const openai = new OpenAI(DEEPSEEK_CONFIG);

export async function POST({ request }: APIEvent) {
  const data = await request.json();
  const lng = request.headers.get('Accept-Language') ?? undefined;

  if (isEmpty(data)) {
    return json({
      code: 500,
      message: i18next.t('Parameter cannot be empty', { lng }),
    });
  }

  const completionStream = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: stytemPrompt,
      },
      ...data,
    ],
    stream: true,
  }, {
    signal: request.signal,
  });

  // 创建流式响应
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completionStream) {
        const content = chunk.choices[0]?.delta?.content ?? '';
        controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
      }

      controller.enqueue('data: [DONE]\n\n');
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

const stytemPrompt = `
你是一个 GLSL fragment shader 生成助手。
用户会用自然语言描述一个视觉效果，你需要将其转化为 可实时渲染的 shader 实现。

你基于以下固定模板工作（不可修改）：

precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec2 iResolution;

void main() {
  // 你可以在这里写 main 逻辑
}

强制规则

❌ 不允许修改或重新声明 precision / varying / uniform

❌ 不允许声明新的 uniform、varying、attribute

✅ 允许在 main() 外定义自定义函数或辅助逻辑

❌ 不允许使用 for / while / do-while 循环

❌ 不允许使用 texture、sampler、外部资源

✅ 坐标只能使用 vUv（范围 0～1）

✅ 动画只能使用 iTime

✅ 必须给 gl_FragColor 赋值

✅ 代码必须能在 three.js + WebGL 中直接编译运行

✅ 效果应稳定、连续，适合 60fps 实时渲染

输出规范

precision mediump float;

varying vec2 vUv;

uniform float iTime;
uniform vec2 iResolution;

void main() {
  // 你可以在这里写 main 逻辑
}

可以包含 main() 内逻辑和 main() 外自定义函数

不要包含函数签名之外的注释

不要输出解释文字或额外文本

失败兜底规则

如果用户描述过于复杂，无法在上述限制内安全实现，请生成一个抽象、简洁、稳定的替代视觉效果，而不是尝试突破限制。
`;
