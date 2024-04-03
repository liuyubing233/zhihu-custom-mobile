import { formatDataToHump, requestComment, requestCommentChild } from '../commons/request';
import { myScroll } from '../commons/scroll-stop-on';
import { dom, domById, throttle } from '../commons/tools';
import { ID_CTZ_COMMENT, ID_CTZ_COMMENT_BACK, ID_CTZ_COMMENT_CHILD, ID_CTZ_COMMENT_CLOSE } from '../configs';
import { IMyElement } from '../types';
import { myLoadingToast } from '../types/loading-toast';
import { IAuthorTag, ICommentData, ICommentPaging } from '../types/zhihu-comment.type';
import { openEnd, openLoading, removeByBox } from './listen-common';
import { timeFormatter } from './time';

/** 查找插入列表元素 */
const QUERY_LIST = '.ctz-comment-list';
const CLASS_LOADING = 'ctz-comment-loading';
const ClASS_END = 'ctz-comment-end';

const ACTIVE_STYLE = 'color: rgb(25, 27, 31);background: #fff;';

const myChangeCommentSort: Record<string, () => void> = {
  /** 默认排序 */
  score: () => {
    dom('.ctz-comment-sort>button[name="score"]')!.style.cssText = ACTIVE_STYLE;
    dom('.ctz-comment-sort>button[name="ts"]')!.style.cssText = '';
  },
  /** 时间排序 */
  ts: () => {
    dom('.ctz-comment-sort>button[name="ts"]')!.style.cssText = ACTIVE_STYLE;
    dom('.ctz-comment-sort>button[name="score"]')!.style.cssText = '';
  },
};

/** 评论处理方式 */
export const myListenComment: myListenComment = {
  page: {
    isEnd: true,
    isStart: true,
    next: '',
    previous: '',
    totals: 0,
  },
  commentData: [],
  answerId: undefined,
  initOperate: function () {
    const me = this as myListenComment;
    domById(ID_CTZ_COMMENT)!.onclick = async (event) => {
      const nodeCurrent = event.target as IMyElement;
      const { id, name } = nodeCurrent;
      // 关闭弹窗按钮
      if (id === ID_CTZ_COMMENT_CLOSE) {
        dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!.scrollTop = 0;
        domById(ID_CTZ_COMMENT)!.style.display = 'none';
        myScroll.on();
      }

      // 加载子评论
      if (name === 'comment-more') {
        const idComment = nodeCurrent.getAttribute('data-id') || undefined;
        const parentComment = me.commentData.find((i) => `${i.id}` === `${idComment}`);
        myListenCommentChild.create(idComment, parentComment);
      }

      if (name === 'score' || name === 'ts') {
        if (nodeCurrent.style.cssText) return;
        myChangeCommentSort[name] && myChangeCommentSort[name]();
        me.create(me.answerId, undefined, name);
      }
    };

    dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!.onscroll = throttle(() => {
      const { isEnd, next, totals } = me.page;
      if (isEnd || !next || me.commentData.length >= totals) return;
      const nodeContentDiv = dom(`#${ID_CTZ_COMMENT} ${QUERY_LIST}`)!;
      const bounding = nodeContentDiv.getBoundingClientRect();
      if (bounding.bottom - 100 <= window.innerHeight) {
        openLoading(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, CLASS_LOADING);
        me.commentLoadMore();
      }
    }, 300);
  },
  /** 打开｜创建评论弹窗 */
  create: async function (answerId, _, orderBy = 'score', type = 'answers') {
    myLoadingToast.open();
    this.answerId = answerId;
    const res = await requestComment({ answerId, orderBy, type });
    myLoadingToast.hide();
    if (!res) return;
    const nRes = formatDataToHump(res);
    const nodeComment = domById(ID_CTZ_COMMENT)!;
    nodeComment.querySelector('.ctz-comment-count>span')!.innerHTML = `${nRes.paging.totals}`;
    nodeComment.querySelector(QUERY_LIST)!.innerHTML = createCommentHTML(nRes.data);
    myChangeCommentSort[orderBy]();
    removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, ClASS_END);
    removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, CLASS_LOADING);
    nodeComment.style.display = 'flex';
    this.page = nRes.paging;
    this.commentData = nRes.data;
    if (nRes.paging.isEnd) {
      openEnd(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, ClASS_END);
    }
    myScroll.stop();
  },
  /** 评论列表加载更多 */
  commentLoadMore: async function () {
    const res = await requestComment({ url: this.page.next });
    if (!res || !res.data) return;
    const nRes = formatDataToHump(res);
    const nodeCommentContentDiv = dom(`#${ID_CTZ_COMMENT} ${QUERY_LIST}`)!;
    this.page = nRes.paging;
    this.commentData = this.commentData.concat(nRes.data);
    nodeCommentContentDiv.innerHTML += createCommentHTML(nRes.data);
    removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, CLASS_LOADING);
    if (nRes.paging.isEnd) {
      openEnd(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, ClASS_END);
    }
  },
};

/** 子评论弹窗 */
export const myListenCommentChild: myListenComment = {
  page: {
    isEnd: true,
    isStart: true,
    next: '',
    previous: '',
    totals: 0,
  },
  commentData: [],
  answerId: undefined,
  initOperate: function () {
    const me = this;
    domById(ID_CTZ_COMMENT_CHILD)!.onclick = (event) => {
      const currentTarget = event.target as IMyElement;
      if (currentTarget.id === ID_CTZ_COMMENT_BACK) {
        dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!.scrollTop = 0;
        domById(ID_CTZ_COMMENT_CHILD)!.style.display = 'none';
      }
    };

    dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!.onscroll = throttle(() => {
      const { isEnd, next, totals } = me.page;
      if (isEnd || !next || me.commentData.length >= totals) return;
      const nodeContentDiv = dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LIST}`)!;
      const bounding = nodeContentDiv.getBoundingClientRect();
      if (bounding.bottom - 100 <= window.innerHeight) {
        openLoading(domById(ID_CTZ_COMMENT_CHILD)!, CLASS_LOADING);
        me.commentLoadMore();
      }
    }, 300);
  },
  create: async function (answerId, parentData) {
    myLoadingToast.open();
    this.answerId = answerId;
    const res = await requestCommentChild({ answerId });
    myLoadingToast.hide();
    if (!res) return;
    const nRes = formatDataToHump(res);
    const nodeComment = domById(ID_CTZ_COMMENT_CHILD)!;
    const parentCommentHTML = parentData ? createCommentHTMLItem(parentData, false, false) : '';
    nodeComment.querySelector(QUERY_LIST)!.innerHTML =
      parentCommentHTML + `<div class="ctz-comment-child-count">${nRes.paging.totals} 条回复</div>` + createCommentHTML(nRes.data);
    removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, ClASS_END);
    removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, CLASS_LOADING);
    nodeComment.style.display = 'flex';
    this.page = nRes.paging;
    this.commentData = nRes.data;
    if (nRes.paging.isEnd) {
      openEnd(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, ClASS_END);
    }
    myScroll.stop();
  },
  commentLoadMore: async function () {
    const res = await requestComment({ url: this.page.next });
    if (!res || !res.data) return;
    const nRes = formatDataToHump(res);
    const nodeCommentContentDiv = dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LIST}`)!;
    this.page = nRes.paging;
    this.commentData = this.commentData.concat(nRes.data);
    nodeCommentContentDiv.innerHTML += createCommentHTML(nRes.data);
    removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, CLASS_LOADING);
    if (nRes.paging.isEnd) {
      openEnd(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, ClASS_END);
    }
  },
};

const createCommentHTML = (data: ICommentData[], isChild = false) => data.map((i) => createCommentHTMLItem(i, isChild)).join('');

const createCommentHTMLItem = (item: ICommentData, isChild = false, haveChild = true): string => {
  const { author, id, authorTag, content, createdTime, hot, likeCount, childComments = [], childCommentCount, childCommentNextOffset, replyToAuthor } = item;
  return `
<div data-id="${id}">
  <div class="ctz-ci ${isChild ? 'ctz-ci-child' : ''}">
    <div class="ctz-ci-avatar">
      <a href="//www.zhihu.com/people/${author.id}" target="_blank"><img class="Avatar" src="${author.avatarUrl}" srcset="${
    author.avatarUrl
  }" alt="invalid s" loading="lazy"></a>
    </div>
    <div class="ctz-ci-right">
      <div class="ctz-ci-user">
        <a href="//www.zhihu.com/people/${author.id}" target="_blank">${author.name}</a>
        ${authorTag.map(createUserTagHTML).join('')}
        ${
          replyToAuthor && replyToAuthor.name
            ? `<span>‣</span><a href="//www.zhihu.com/people/${replyToAuthor.id}" target="_blank">${replyToAuthor.name}</a>`
            : ''
        }
      </div>
      <div class="ctz-ci-content">${content}</div>
      <div class="ctz-ci-info">
        <div class="ctz-ci-info-left">
          <span>${timeFormatter(+`${createdTime}000`, 'YYYY-MM-DD')}</span>
          ${hot ? '<span style="color: rgb(255, 150, 7);font-weight:bold;">热评</span>' : ''}
        </div>
        <div class="ctz-ci-info-right">
          <span>❤︎ ${likeCount}</span>
        </div>
      </div>
    </div>
  </div>
  ${haveChild ? childComments.map((i) => createCommentHTMLItem(i, true)).join('') : ''}
  ${
    haveChild && childCommentCount > childComments.length
      ? `<button class="ctz-comment-button" name="comment-more" data-next-offset="${childCommentNextOffset}" data-id="${id}">查看全部 ${childCommentCount} 条回复 ➤</button>`
      : ''
  }
</div>`;
};

/** 用户名后的标签 */
const createUserTagHTML = (item: IAuthorTag) => {
  const { hasBorder, borderColor, color, text } = item;
  return `<div class="ctz-tag" style="${hasBorder ? `border: 1px solid ${borderColor};` : ''}color: ${color};">${text}</div>`;
};

interface myListenComment {
  page: ICommentPaging;
  commentData: ICommentData[];
  answerId?: string | number;
  initOperate: () => void;
  create: (answerId?: string | number, parentData?: ICommentData, sort?: string, type?: 'answers' | 'articles') => Promise<void>;
  commentLoadMore: () => Promise<void>;
}
