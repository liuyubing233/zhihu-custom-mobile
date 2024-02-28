/** 缓存浏览历史记录 */
export interface IHistory {
  list: string[];
  view: string[];
}

export type IKeyofHistory = keyof IHistory;
