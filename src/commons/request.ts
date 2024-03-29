import { IRequestCommentParams } from '../types';
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

/** 获取知乎评论区内容 */
export const requestComment = async ({ url, answerId, orderBy = 'score', offset = '' }: IRequestCommentParams): Promise<IZhihuCommentResponse | undefined> => {
  // order_by: ts, score
  if (!answerId && !url) return undefined;
  const nUrl = url || `/api/v4/comment_v5/answers/${answerId}/root_comment?order_by=${orderBy}&limit=20&offset=${offset}`;
  return fetch(nUrl, {
    method: 'GET',
    headers: createCommentHeaders(nUrl),
  }).then((res) => res.json());
};

/** 获取知乎评论区子评论内容 */
export const requestCommentChild = async ({ url, answerId, orderBy = 'ts', offset = '' }: IRequestCommentParams): Promise<IZhihuCommentResponse | undefined> => {
  // order_by: ts, score
  if (!answerId && !url) return undefined;
  const nUrl = url || `/api/v4/comment_v5/comment/${answerId}/child_comment?order_by=${orderBy}&limit=20&offset=${offset}`;
  return fetch(nUrl, {
    method: 'GET',
    headers: createCommentHeaders(nUrl),
  }).then((res) => res.json());
};

