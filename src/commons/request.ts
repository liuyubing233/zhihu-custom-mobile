import { EVoteType, EZhihuType, IRequestCommentParams, IResponseVote, VoteTypeOb } from '../types';
import { IZhihuAnswerTarget } from '../types/zhihu-answer.type';
import { IZhihuCommentResponse } from '../types/zhihu-comment.type';
import md5 from './third/md5.js';
import zhihu_enc from './third/zhihu-enc.js';

const createCommentHeaders = (url: string) => {
  function K() {
    var t = new RegExp('d_c0=([^;]+)').exec(document.cookie);
    return t && t[1];
  }
  var z = function (t: string) {
    var e = new URL(t, 'https://www.zhihu.com');
    return '' + e.pathname + e.search;
  };
  var S = (function (t, e, n, r) {
    var o = n.zse93,
      i = n.dc0,
      a = n.xZst81,
      u = z(t),
      c = '',
      s = [o, u, i, '', a].filter(Boolean).join('+');
    return {
      source: s,
      signature: zhihu_enc(md5(s)),
    };
  })(url, void 0, {
    zse93: '101_3_3.0',
    dc0: K(),
    xZst81: null,
  });

  return {
    'x-zse-93': '101_3_3.0',
    'x-zse-96': '2.0_' + S.signature,
  };
};

/** 转驼峰 */
export function formatDataToHump(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map((item) => {
      return typeof item === 'object' ? formatDataToHump(item) : item;
    });
  } else if (typeof data === 'object') {
    const nData: any = {};
    Object.keys(data).forEach((prevKey) => {
      const nKey = prevKey.replace(/\_(\w)/g, (_, $1) => $1.toUpperCase());
      nData[nKey] = formatDataToHump(data[prevKey]);
    });
    return nData;
  }
  return data;
}

/** 获取知乎评论区内容 */
export const requestComment = async ({
  url,
  answerId,
  orderBy = 'score',
  offset = '',
  type = 'answers',
}: IRequestCommentParams): Promise<IZhihuCommentResponse | undefined> => {
  // order_by: ts, score
  if (!answerId && !url) return undefined;
  const nUrl = url || `https://www.zhihu.com/api/v4/comment_v5/${type}/${answerId}/root_comment?order_by=${orderBy}&limit=20&offset=${offset}`;
  return fetch(nUrl, {
    method: 'GET',
    headers: createCommentHeaders(nUrl),
  })
    .then((res) => res.json())
    .then((res) => formatDataToHump(res));
};

/** 获取知乎评论区子评论内容 */
export const requestCommentChild = async ({
  url,
  answerId,
  orderBy = 'ts',
  offset = '',
}: IRequestCommentParams): Promise<IZhihuCommentResponse | undefined> => {
  // order_by: ts, score
  if (!answerId && !url) return undefined;
  const nUrl = url || `https://www.zhihu.com/api/v4/comment_v5/comment/${answerId}/child_comment?order_by=${orderBy}&limit=20&offset=${offset}`;
  return fetch(nUrl, {
    method: 'GET',
    headers: createCommentHeaders(nUrl),
  })
    .then((res) => res.json())
    .then((res) => formatDataToHump(res));
};

/** 默认请求方法 */
export const commonRequest = async (url: string, method = 'GET', headers = new Headers()): Promise<any> => {
  if (!url) return undefined;
  return fetch(url, { method, headers })
    .then((res) => res.json())
    .then((res) => formatDataToHump(res));
};

/**
 * 内容点赞接口
 * @param contentType 内容类型
 * @param voteType 点赞类型
 * @param contentId 内容ID
 * @returns {IResponseVote}
 */
export const requestVote = async (contentType: EZhihuType, voteType: EVoteType, contentId: string | number): Promise<IResponseVote | undefined> => {
  const body = VoteTypeOb[voteType][contentType];
  if (!body) return undefined;
  return fetch(`https://www.zhihu.com/api/v4/${contentType}/${contentId}/voters`, {
    method: 'POST',
    headers: {
      ...new Headers(),
      'Content-Type': 'application/json',
    },
    body,
  })
    .then((res) => res.json())
    .then((res) => formatDataToHump(res));
};

/**
 * 点赞评论
 * @param commendId 评论ID
 * @param like 点赞 or 取消点赞
 * @returns {any}
 */
export const requestCommentVote = async (commendId: string | number | null, like = true): Promise<any> => {
  if (!commendId) return undefined;
  return fetch(`https://www.zhihu.com/api/v4/comments/${commendId}/like`, {
    method: like ? 'POST' : 'DELETE',
    headers: new Headers(),
  })
    .then((res) => res.json())
    .then((res) => formatDataToHump(res));
};

/**
 * 根据回答ID请求回答内容
 * @param answerId 回答ID
 * @returns {IZhihuAnswerTarget}
 */
export const requestAnswer = async (answerId: string): Promise<IZhihuAnswerTarget | undefined> => {
  if (!answerId) return undefined;
  const url = `https://www.zhihu.com/api/v4/answers/${answerId}?include=is_visible%2Cpaid_info%2Cpaid_info_content%2Cadmin_closed_comment%2Creward_info%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Cis_normal%2Cis_sticky%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Cthanks_count%2Cfavlists_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Ccreated_time%2Cupdated_time%2Creview_info%2Crelevant_info%2Cquestion%2Cexcerpt%2Cattachment%2Cis_labeled%2Creaction_instruction%2Cip_info%2Crelationship.is_authorized%2Cvoting%2Cis_thanked%2Cis_author%2Cis_nothelp%3Bauthor.vip_info%2Cbadge%5B*%5D.topics%3Bsettings.table_of_content.enabled`;
  return fetch(url, {
    method: 'GET',
    headers: createCommentHeaders(url),
  })
    .then((res) => res.json())
    .then((res) => formatDataToHump(res));
};
