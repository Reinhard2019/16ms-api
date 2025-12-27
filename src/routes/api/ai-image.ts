// your_script_using_genai.js
// import 'global-agent';

// 1. 设置代理 URL
// 确保这个 URL 匹配您的代理服务
// process.env.GLOBAL_AGENT_HTTP_PROXY = "http://127.0.0.1:7890";

// // 2. 初始化 global-agent，它会接管所有 http/https 请求
// setGlobal(global.process.env);

import { type APIEvent } from "@solidjs/start/server";
import { json } from "@solidjs/router";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import OSS from "ali-oss";
import { nanoid } from "nanoid";
import { GET as getToken } from "./upload-token";
import { calculateFileHash, isAdmin } from "src/utils";
// import { setGlobalDispatcher, fetch, ProxyAgent } from 'undici';

// const proxyUrl = 'http://127.0.0.1:7890';

// setGlobalDispatcher(new ProxyAgent(proxyUrl));

const ai = new GoogleGenAI({ apiKey: "gen-lang-client-0017686768" });

export async function POST({ request, locals }: APIEvent) {
  // const prompt =
  //   'Create a picture of a nano banana dish in a fancy restaurant with a Gemini theme';

  // const client = new OpenAI();

  // const response = await client.responses.create({
  //   model: 'gpt-5-nano',
  //   input: 'Write a one-sentence bedtime story about a unicorn.',
  //   // stream: true,
  // });

  // const dispatcher = new ProxyAgent('http://127.0.0.1:7890');
  // const res = await fetch('https://api.openai.com/v1/models', {
  //   // dispatcher,
  //   headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  // });
  // console.log(res.status, await res.text());

  // console.log(response.output_text);

  // console.log('get');

  // const url = 'https://google.com/';
  // const dispatcher = new ProxyAgent('http://127.0.0.1:7890');
  // const response = await fetch(url, {
  //   dispatcher, // ⭐ 关键点
  // });

  // const text = await response.text();
  // console.log('response.ok11111', response.ok, text)

  // const response = await ai.models.generateContent({
  //   model: "gemini-3-pro-image-preview",
  //   contents: prompt,
  // });
  // for (const part of response.candidates![0].content!.parts!) {
  //   if (part.text) {
  //     console.log(part.text);
  //   } else if (part.inlineData) {
  //     const imageData = part.inlineData.data!;
  //     const buffer = Buffer.from(imageData, "base64");
  //     // fs.writeFileSync("gemini-native-image.png", buffer);
  //     console.log("Image saved as gemini-native-image.png");
  //   }
  // }

  const user = locals.user;

  if (!isAdmin(user))
    return json({
      code: 400,
      message: "当前用户无权限",
    });

  const { prompt } = await request.json();

  if (!prompt)
    return json({
      code: 400,
      message: "prompt is required",
    });

  const aiResp = await fetch(
    "https://ark.cn-beijing.volces.com/api/v3/images/generations",
    {
      method: "POST",
      body: JSON.stringify({
        model: "doubao-seedream-4-5-251128",
        prompt,
        size: "2K",
        watermark: false,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 7909ed70-4dc0-4e51-8ced-f9979a40fdb2",
      },
    },
  );
  const imgItem = (await aiResp.json()).data[0];

  const { url } = imgItem;

  const size = imgItem.size.split("x");

  // 1. 拉取图片
  const imageResponse = await fetch(url);
  if (!imageResponse.ok) throw new Error("图片拉取失败");

  const arrayBuffer = await imageResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const resp = await (await getToken()).json();
  if (resp.code !== 200) return json(resp);

  const contentType =
    imageResponse.headers.get("content-type") || "application/octet-stream";

  const client = new OSS({
    bucket: "yishun-user",
    region: "oss-cn-shanghai",
    accessKeyId: resp.data!.AccessKeyId,
    accessKeySecret: resp.data!.AccessKeySecret,
    stsToken: resp.data!.SecurityToken,
    // authorizationV4: true,
    // 刷新临时访问凭证。
    refreshSTSToken: async () => {
      const refreshResp = await (await getToken()).json();
      return {
        accessKeyId: refreshResp.data!.AccessKeyId,
        accessKeySecret: refreshResp.data!.AccessKeySecret,
        stsToken: refreshResp.data!.SecurityToken,
      };
    },
  });

  // buffer.length
  const key = await calculateFileHash(buffer);
  await client.put(key, buffer, {
    headers: {
      "Content-Type": contentType,
    },
  });

  // 根据 content-type 自动生成扩展名
  let ext = "";
  if (contentType.includes("jpeg")) ext = ".jpg";
  else if (contentType.includes("png")) ext = ".png";
  else if (contentType.includes("gif")) ext = ".gif";
  else if (contentType.includes("webp")) ext = ".webp";
  else if (contentType.includes("bmp")) ext = ".bmp";
  else if (contentType.includes("svg")) ext = ".svg";
  else ext = "";

  return json({
    code: 200,
    data: {
      key,
      name: key + ext,
      size: buffer.length,
      type: contentType,
      width: new Number(size[0]),
      height: new Number(size[1]),
    },
  });
}
