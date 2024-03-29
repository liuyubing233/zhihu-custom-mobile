import { requestComment, requestCommentChild } from '../commons/request';
import { myScroll } from '../commons/scroll-stop-on';
import { dom, domById, throttle } from '../commons/tools';
import { ID_CTZ_COMMENT, ID_CTZ_COMMENT_BACK, ID_CTZ_COMMENT_CHILD, ID_CTZ_COMMENT_CLOSE } from '../configs';
import { IMyElement } from '../types';
import { myLoadingToast } from '../types/loading-toast';
import { IAuthorTag, ICommentData, ICommentPaging, IZhihuCommentResponse } from '../types/zhihu-comment.type';
import { timeFormatter } from './time';

/** 查找插入列表元素 */
const QUERY_LIST = '.ctz-comment-list';
/** 查找评论加载中 */
const QUERY_LOADING = '.ctz-comment-loading';
/** 查找评论没有更多了 */
const QUERY_END = '.ctz-comment-end';

/** 评论处理方式 */
export const myListenComment: myListenComment = {
  page: {
    is_end: true,
    is_start: true,
    next: '',
    previous: '',
    totals: 0,
  },
  commentData: [],
  initOperate: function () {
    const me = this;
    domById(ID_CTZ_COMMENT)!.onclick = async (event) => {
      const nodeCurrent = event.target as IMyElement;
      console.log('event.target', event.target);
      // 关闭弹窗按钮
      if (nodeCurrent.id === ID_CTZ_COMMENT_CLOSE) {
        domById(ID_CTZ_COMMENT)!.style.display = 'none';
        myScroll.on();
      }

      // 加载子评论
      if (nodeCurrent.name === 'comment-more') {
        myLoadingToast.open();
        const idComment = nodeCurrent.getAttribute('data-id') || undefined;
        const parentComment = me.commentData.find((i) => `${i.id}` === `${idComment}`);
        const res = await requestCommentChild({ answerId: idComment });
        res && myListenCommentChild.create(res, parentComment);
        myLoadingToast.hide();
      }
    };

    dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!.onscroll = throttle(() => {
      const { is_end, next, totals } = me.page;
      if (is_end || !next || me.commentData.length >= totals) return;
      const nodeContentDiv = dom(`#${ID_CTZ_COMMENT} ${QUERY_LIST}`)!;
      const bounding = nodeContentDiv.getBoundingClientRect();
      if (bounding.bottom - 100 <= window.innerHeight) {
        me.openLoading();
        me.commentLoadMore();
      }
    }, 300);
  },
  /** 打开｜创建评论弹窗 */
  create: function (res: IZhihuCommentResponse) {
    const nodeComment = domById(ID_CTZ_COMMENT)!;
    nodeComment.querySelector('.ctz-comment-count>span')!.innerHTML = `${res.paging.totals}`;
    nodeComment.querySelector(QUERY_LIST)!.innerHTML = createCommentHTML(res.data);
    this.hideEnd();
    this.hideLoading();
    nodeComment.style.display = 'flex';
    this.page = res.paging;
    this.commentData = res.data;
    if (res.paging.is_end) {
      this.openEnd();
    }
    myScroll.stop();
  },
  /** 评论列表加载更多 */
  commentLoadMore: async function () {
    const res = await requestComment({ url: this.page.next });
    if (!res || !res.data) return;
    const nodeCommentContentDiv = dom(`#${ID_CTZ_COMMENT} ${QUERY_LIST}`)!;
    this.page = res.paging;
    this.commentData = this.commentData.concat(res.data);
    nodeCommentContentDiv.innerHTML += createCommentHTML(res.data);
    this.hideLoading();
    if (res.paging.is_end) {
      this.openEnd();
    }
  },
  openLoading: () => (dom(`#${ID_CTZ_COMMENT} ${QUERY_LOADING}`)!.style.display = 'block'),
  hideLoading: () => (dom(`#${ID_CTZ_COMMENT} ${QUERY_LOADING}`)!.style.display = 'none'),
  openEnd: () => (dom(`#${ID_CTZ_COMMENT} ${QUERY_END}`)!.style.display = 'block'),
  hideEnd: () => (dom(`#${ID_CTZ_COMMENT} ${QUERY_END}`)!.style.display = 'none'),
};

/** 子评论弹窗 */
export const myListenCommentChild: myListenComment = {
  page: {
    is_end: true,
    is_start: true,
    next: '',
    previous: '',
    totals: 0,
  },
  commentData: [],
  initOperate: function () {
    const me = this;
    domById(ID_CTZ_COMMENT_CHILD)!.onclick = (event) => {
      console.log('ID_CTZ_COMMENT_CHILD', event, event.target);
      const currentTarget = event.target as IMyElement;
      if (currentTarget.id === ID_CTZ_COMMENT_BACK) {
        domById(ID_CTZ_COMMENT_CHILD)!.style.display = 'none';
      }
    };

    dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!.onscroll = throttle(() => {
      const { is_end, next, totals } = me.page;
      if (is_end || !next || me.commentData.length >= totals) return;
      const nodeContentDiv = dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LIST}`)!;
      const bounding = nodeContentDiv.getBoundingClientRect();
      if (bounding.bottom - 100 <= window.innerHeight) {
        me.openLoading();
        me.commentLoadMore();
      }
    }, 300);
  },
  create: function (res: IZhihuCommentResponse, parentData?: ICommentData) {
    const nodeComment = domById(ID_CTZ_COMMENT_CHILD)!;
    const parentCommentHTML = parentData ? createCommentHTMLItem(parentData, false, false) : '';
    nodeComment.querySelector(QUERY_LIST)!.innerHTML =
      parentCommentHTML + `<div class="ctz-comment-child-count">${res.paging.totals} 条回复</div>` + createCommentHTML(res.data);
    this.hideEnd();
    this.hideLoading();
    nodeComment.style.display = 'flex';
    this.page = res.paging;
    this.commentData = res.data;
    if (res.paging.is_end) {
      this.openEnd();
    }
    myScroll.stop();
  },
  commentLoadMore: async function () {
    const res = await requestComment({ url: this.page.next });
    if (!res || !res.data) return;
    const nodeCommentContentDiv = dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LIST}`)!;
    this.page = res.paging;
    this.commentData = this.commentData.concat(res.data);
    nodeCommentContentDiv.innerHTML += createCommentHTML(res.data);
    this.hideLoading();
    if (res.paging.is_end) {
      this.openEnd();
    }
  },
  openLoading: () => (dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LOADING}`)!.style.display = 'block'),
  hideLoading: () => (dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_LOADING}`)!.style.display = 'none'),
  openEnd: () => (dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_END}`)!.style.display = 'block'),
  hideEnd: () => (dom(`#${ID_CTZ_COMMENT_CHILD} ${QUERY_END}`)!.style.display = 'none'),
};

const createCommentHTML = (data: ICommentData[], isChild = false) => data.map((i) => createCommentHTMLItem(i, isChild)).join('');

const createCommentHTMLItem = (item: ICommentData, isChild = false, haveChild = true): string => {
  const {
    author,
    id,
    author_tag,
    content,
    created_time,
    hot,
    like_count,
    child_comments = [],
    child_comment_count,
    child_comment_next_offset,
    reply_to_author,
  } = item;
  return `
<div data-id="${id}">
  <div class="ctz-ci ${isChild ? 'ctz-ci-child' : ''}">
    <div class="ctz-ci-avatar">
      <a href="//www.zhihu.com/people/${author.id}" target="_blank"><img class="Avatar" src="${author.avatar_url}" srcset="${
    author.avatar_url
  }" alt="invalid s" loading="lazy"></a>
    </div>
    <div class="ctz-ci-right">
      <div class="ctz-ci-user">
        <a href="//www.zhihu.com/people/${author.id}" target="_blank">${author.name}</a>
        ${author_tag.map(createUserTagHTML).join('')}
        ${
          reply_to_author && reply_to_author.name
            ? `<span>‣</span><a href="//www.zhihu.com/people/${reply_to_author.id}" target="_blank">${reply_to_author.name}</a>`
            : ''
        }
      </div>
      <div class="ctz-ci-content">${content}</div>
      <div class="ctz-ci-info">
        <div class="ctz-ci-info-left">
          <span>${timeFormatter(+`${created_time}000`, 'YYYY-MM-DD')}</span>
          ${hot ? '<span style="color: rgb(255, 150, 7);font-weight:bold;">热评</span>' : ''}
        </div>
        <div class="ctz-ci-info-right">
          <span>❤︎ ${like_count}</span>
        </div>
      </div>
    </div>
  </div>
  ${haveChild ? child_comments.map((i) => createCommentHTMLItem(i, true)).join('') : ''}
  ${
    haveChild && child_comment_count > child_comments.length
      ? `<button class="ctz-comment-button" name="comment-more" data-next-offset="${child_comment_next_offset}" data-id="${id}">查看全部 ${child_comment_count} 条回复 ➤</button>`
      : ''
  }
</div>`;
};

/** 用户名后的标签 */
const createUserTagHTML = (item: IAuthorTag) => {
  const { has_border, border_color, color, text } = item;
  return `<div class="ctz-tag" style="${has_border ? `border: 1px solid ${border_color};` : ''}color: ${color};">${text}</div>`;
};

interface myListenComment {
  page: ICommentPaging;
  commentData: ICommentData[];
  initOperate: () => void;
  create: (res: IZhihuCommentResponse, parentData?: ICommentData) => void;
  commentLoadMore: () => Promise<void>;
  openLoading: () => void;
  hideLoading: () => void;
  openEnd: () => void;
  hideEnd: () => void;
}