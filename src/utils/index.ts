import { User } from "@prisma/client";
import { createXXHash3 } from "hash-wasm";
import { RemoteFile } from "src/types";

/**
 * 树状结构查找
 * @param nodes
 * @param children
 * @param predicate
 * @returns 返回的是[...祖先, 自身]
 */
export function treeFind<T>(
  nodes: T[] | undefined,
  children: (item: T) => T[] | undefined,
  predicate: (value: T) => boolean,
): T[] | undefined | null {
  if (!nodes) return;

  for (const node of nodes) {
    if (predicate(node)) return [node];

    const res = treeFind(children(node), children, predicate);
    if (res) return [node, ...res];
  }
}

/**
 * 树状结构遍历
 * @param nodes
 * @param children
 * @param callback
 * @param priority 优先遍历 parent 或者优先遍历 children
 * @returns
 */
export function treeForEach<T>(
  nodes: T[] | undefined,
  children: (item: T) => T[] | undefined,
  callback: (item: T, _parentList?: T[]) => void,
  priority: "parent" | "children" = "parent",
  parentList?: T[],
) {
  if (!nodes) return;

  for (const node of nodes) {
    const newParentList = [...(parentList ?? []), node];
    if (priority === "parent") {
      callback(node, parentList);
      treeForEach(children(node), children, callback, priority, newParentList);
    } else {
      treeForEach(children(node), children, callback, priority, newParentList);
      callback(node, parentList);
    }
  }
}

/**
 * 树状结构映射
 * @param nodes
 * @param getChildren
 * @param callback
 * @returns
 */
export function treeMap<T, U>(
  nodes: T[] | undefined,
  getChildren: (item: T) => T[] | undefined,
  callback: (item: T) => U,
  setChildren: (item: U, children: U[] | undefined) => void,
): U[] | undefined {
  if (!nodes) return;

  for (const node of nodes) {
    callback(node);
    treeForEach(getChildren(node), getChildren, callback);
  }

  return nodes.map((node) => {
    const newNode = callback(node);
    const newChildren = treeMap(
      getChildren(node),
      getChildren,
      callback,
      setChildren,
    );
    setChildren(newNode, newChildren);
    return newNode;
  });
}

const OSS_HOST = "https://yishun-user.oss-cn-shanghai.aliyuncs.com";

export function getRemoteFileUrl(remoteFile: RemoteFile | undefined | null) {
  return remoteFile ? `${OSS_HOST}/${remoteFile.key}` : undefined;
}

export async function calculateFileHash(file: Blob | Buffer) {
  const xxHash3 = await createXXHash3();

  if (file instanceof Blob) {
    const chunkSize = 4 * 1024 * 1024; // 每次读取 4MB
    let offset = 0;

    while (offset < file.size) {
      const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
      xxHash3.update(new Uint8Array(chunk)); // 直接用当前 chunk 更新 hash
      offset += chunkSize;
    }

    return xxHash3.digest();
  }

  xxHash3.update(new Uint8Array(file));
  return xxHash3.digest();
}

export function isAdmin(user: User) {
  return user.email === "XNBigDevil@gmail.com";
}
