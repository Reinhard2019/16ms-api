import { json } from "@solidjs/router";
import { keyBy } from "lodash-es";
import { type APIEvent } from "@solidjs/start/server";
import { db } from "src/db";
import { type Key, type RemoteFile } from "src/types";

export interface PlainMenuItem {
  key: Key;
  label: string;
  children?: PlainMenuItem[];
}

export type ExamplesResponseData = ReturnType<
  Awaited<ReturnType<typeof GET>>["customBody"]
>["data"];

export async function GET({ locals }: APIEvent) {
  const userId = locals.userId;

  const categories = await db.videoExampleCategories.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const categoryMap = new Map<number, PlainMenuItem>();
  categories.forEach((category) => {
    categoryMap.set(category.id, { key: category.id, label: category.name });
  });

  const categoryTree: PlainMenuItem[] = [];
  categories.forEach((category) => {
    if (category.parentId === null) {
      categoryTree.push(categoryMap.get(category.id)!);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(categoryMap.get(category.id)!);
      }
    }
  });

  const categoryExampleIdsList = new Map<
    Key /** categoryId */,
    string[] /** exampleIds */
  >();

  const videoToExampleCategoryList = await db.videoToExampleCategory.findMany();

  videoToExampleCategoryList.forEach((videoToExampleCategory) => {
    const exampleIds = categoryExampleIdsList.get(
      videoToExampleCategory.categoryId,
    );
    if (exampleIds) {
      exampleIds.push(videoToExampleCategory.videoId);
    } else {
      categoryExampleIdsList.set(videoToExampleCategory.categoryId, [
        videoToExampleCategory.videoId,
      ]);
    }
  });

  const exampleIds = videoToExampleCategoryList.map((item) => item.videoId);

  const videos = await db.video.findMany({
    where: {
      userId,
      id: {
        in: exampleIds,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const videoDict = keyBy(videos, (v) => v.id);

  const categoryExamplesList: Array<
    [
      categoryId: Key,
      examples: Array<{
        id: string;
        avatar?: RemoteFile | null;
        title: string;
      }>,
    ]
  > = Array.from(categoryExampleIdsList.entries()).map(([key, ids]) => [
    key,
    ids.flatMap((id) => {
      const video = videoDict[id];
      if (!video) return [];
      return {
        id,
        avatar: video.avatar as unknown as RemoteFile,
        title: video.title,
      };
    }),
  ]);

  return json({
    code: 200,
    data: {
      categories: categoryTree,
      categoryExamplesDict: Object.fromEntries(categoryExamplesList),
    },
  });
}
