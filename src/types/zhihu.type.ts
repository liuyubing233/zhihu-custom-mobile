export type IContentResType = 'answer' | 'article' | 'zvideo' | 'pin';

export enum EZhihuType {
  回答 = 'answers',
  文章 = 'articles',
  视频 = 'zvideos',
}

export enum EVoteType {
  赞同,
  中立,
  反对,
}

export const VoteTypeOb = {
  [EVoteType.赞同]: {
    [EZhihuType.回答]: '{"type":"up"}',
    [EZhihuType.文章]: '{"voting":1}',
    [EZhihuType.视频]: '{"voting":1}',
  },
  [EVoteType.中立]: {
    [EZhihuType.回答]: '{"type":"neutral"}',
    [EZhihuType.文章]: '{"voting":0}',
    [EZhihuType.视频]: '{"voting":0}',
  },
  [EVoteType.反对]: {
    [EZhihuType.回答]: '{"type":"down"}',
    [EZhihuType.文章]: '{"voting":-1}',
    [EZhihuType.视频]: '{"voting":-1}',
  },
};

/** 内容点赞、反对、取消点赞的返回值 */
export interface IResponseVote {
  reactionCount: number;
  reactionState: boolean;
  reactionValue: string;
  success: boolean;
  isThanked: boolean;
  thanksCount: number;
  redHeartCount: number;
  redHeartHasSet: boolean;
  isLiked: boolean;
  likedCount: number;
  isUp: boolean;
  voteupCount: number;
  isUpped: boolean;
  upCount: number;
  is_down: boolean;
  voting: number;
  heavyUpResult: string;
  isAutoSendMoments: boolean;
}
