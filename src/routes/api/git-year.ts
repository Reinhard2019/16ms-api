import { json } from "@solidjs/router";
import { type APIEvent } from "@solidjs/start/server";
import OpenAI from "openai";
import { DEEPSEEK_CONFIG } from "src/consts";
import dayjs from "dayjs";

const openai = new OpenAI(DEEPSEEK_CONFIG);

const { VITE_GITHUB_TOKEN } = import.meta.env;

export async function POST({ request }: APIEvent) {
  const data = await request.json();

  const year = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + VITE_GITHUB_TOKEN,
    },
    body: JSON.stringify({
      query: `
    query {
      user(login: "${data.username}") {
        login
        name
        avatarUrl
        url
        repositories(
          first: 100
          privacy: PUBLIC
          ownerAffiliations: OWNER
          orderBy: { field: CREATED_AT, direction: ASC }
        ) {
          nodes {
            name
            createdAt
          }
          totalCount
        }
        starredRepositories(first: 100, orderBy: { field: STARRED_AT, direction: DESC }) {
          edges {
            starredAt
            node {
              name
              url
            }
          }
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
        }

        contributionsCollection(from: "2025-01-01T00:00:00Z", to: "2025-12-31T23:59:59Z") {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }

          pullRequestContributionsByRepository {
            repository {
              name
            }
            contributions(first: 100) {
              totalCount
            }
          }

          issueContributionsByRepository {
            repository {
              name
            }
            contributions(first: 100) {
              nodes {
                issue {
                  state
                }
              }
              totalCount
            }
          }

          commitContributionsByRepository {
            repository {
              name
              languages(first: 20) {
                edges {
                  size      # 每种语言的字节数
                  node {
                    name   # 语言名 (TypeScript / Go / Rust...)
                    color  # GitHub 的语言颜色
                  }
                }
              }
            }
            contributions(first: 100) {
              totalCount
            }
          }
        }
      }
    }
    `,
    }),
  }).then(async (resp) => {
    const user = (await resp.json()).data.user;
    const repositorieNodes = user.repositories.nodes.filter((node: any) =>
      dayjs(node.createdAt).isAfter("2025-01-01"),
    );
    const starredRepositorieNodes = user.starredRepositories.edges.filter(
      (node: any) => dayjs(node.starredAt).isAfter("2025-01-01"),
    );
    return {
      ...user,
      repositories: {
        nodes: repositorieNodes,
        totalCount: repositorieNodes.length,
      },
      starredRepositories: {
        edges: starredRepositorieNodes,
        totalCount: starredRepositorieNodes.length,
      },
    };
  });

  const lng = request.headers.get("Accept-Language") ?? undefined;

  let appraise: {
    score: number;
    tags: Array<{
      name: string;
      color: string;
    }>;
    summary: string;
  } | null = null;

  // - 标签名字前面可以加个颜文字
  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: `你是一个为 GitHub 年度总结视频生成「年度评价内容」的助手。

请根据下面提供的 GitHub 行为数据，
完成以下三项内容：

1️⃣ 生成 2–4 个【开发习惯 / 性格标签】
2️⃣ 给用户这一年的 GitHub 表现打一个【0–100 的综合评分】
3️⃣ 用一句自然语言，对用户这一年的开发状态进行总结

整体要求：
- 内容为娱乐 + 回顾性质，不做负面评价
- 偏中文互联网程序员语境
- 不要提及具体数字或精确统计
- 风格克制、真实、有共鸣，避免鸡汤或营销感
- 适合直接出现在年度总结视频中

【标签要求】
- 使用${lng === "zh" ? "中文" : "English"}返回
- 每个标签不超过 6 个字
- 每个标签的颜色要有差异性
- 体现节奏、习惯、投入度或风格
- 偏中性或积极

【评分要求】
- 分数范围 0–100
- 分数用于年度总结展示，应符合直觉，不必过于严苛
- 不需要解释评分依据

【一句话总结要求】
- 使用${lng === "zh" ? "中文" : "English"}返回
- 1 句话即可
- 不超过 20 个字
- 偏“回顾 + 状态描述”，而不是目标或鼓励

请只输出以下 JSON 结构，不要附加任何解释性文字：

{
  "score": number,
  "tags": Array<{
    name: string
    color: string
  }>,
  "summary": string
}

GitHub 行为数据如下：
${JSON.stringify(year)}
`,
        },
      ],
    });

    const content = /```json\s*([\s\S]*?)\s*```/.exec(
      completion.choices[0]?.message?.content ?? "",
    )?.[1];
    appraise = content ? JSON.parse(content) : null;
  } catch {}

  return json({
    code: 200,
    data: {
      year,
      appraise,
    },
  });
}
