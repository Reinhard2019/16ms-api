export type Key = number | string

export interface RemoteFile {
  key: string
  type: string
  size: number
  name: string
}

export interface BaseResponse<T = unknown> {
  code: 100 | 200 | 401 | 404 | 500
  message?: string
  data?: T
}

interface PlainMenuItem {
  key: Key
  label: string
  children?: PlainMenuItem[]
}

export type ExamplesResponseData = {
    categories: PlainMenuItem[];
    categoryExamplesDict: {
        [k: string]: {
            id: number;
            avatar?: RemoteFile | null;
            title: string;
        }[];
    };
}