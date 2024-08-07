import { requestComment, requestCommentChild } from '../commons/request';
import { myScroll } from '../commons/scroll-stop-on';
import { dom, domById, domC, throttle } from '../commons/tools';
import { ID_CTZ_COMMENT, ID_CTZ_COMMENT_BACK, ID_CTZ_COMMENT_CHILD, ID_CTZ_COMMENT_CLOSE } from '../configs';
import { myLoadingToast } from '../types/loading-toast';
import { IAuthorTag, ICommentData, ICommentPaging } from '../types/zhihu-comment.type';
import { requestCommentVote } from './../commons/request';
import { openEnd, openLoading, removeByBox } from './listen-common';
import { timeFormatter } from './time';

/** 查找插入列表元素 */
const QUERY_LIST = '.ctz-comment-list';
const CLASS_LOADING = 'ctz-comment-loading';
const ClASS_END = 'ctz-comment-end';
const CLASS_VOTE = 'ctz-comment-vote';
const CLASS_VOTE_UP = 'ctz-comment-vote-up';

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

/** 评论点赞 or 取消点赞 */
const eventVoteUp = async (currentNode: HTMLElement) => {
  if (!currentNode.classList.contains(CLASS_VOTE)) return;
  const prevIsVoteUp = currentNode.classList.contains(CLASS_VOTE_UP);
  const commendId = currentNode.getAttribute('data-id');
  const res = await requestCommentVote(commendId, !prevIsVoteUp);
  if (!res) return;
  const nodeCount = currentNode.querySelector('span')!;
  const prevCount = +nodeCount.innerText || 0;
  if (prevIsVoteUp) {
    currentNode.classList.remove(CLASS_VOTE_UP);
    nodeCount.innerText = String(prevCount - 1 >= 0 ? prevCount - 1 : 0);
  } else {
    currentNode.classList.add(CLASS_VOTE_UP);
    nodeCount.innerText = String(prevCount + 1);
  }
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
    domById(ID_CTZ_COMMENT)?.addEventListener('click', async (event) => {
      const nodeCurrent = event.target as HTMLInputElement;
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

      eventVoteUp(nodeCurrent);
    });

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
    const nodeComment = domById(ID_CTZ_COMMENT)!;
    nodeComment.querySelector('.ctz-comment-count>span')!.innerHTML = `${res.paging.totals}`;
    const innerHTML = res.commentStatus.type ? `<div style="text-align:center;">${res.commentStatus.text}</div>` : createCommentHTML(res.data);
    nodeComment.querySelector(QUERY_LIST)!.innerHTML = innerHTML;
    myChangeCommentSort[orderBy]();
    removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, ClASS_END);
    removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, CLASS_LOADING);
    nodeComment.style.display = 'flex';
    this.page = res.paging;
    this.commentData = res.data;
    if (res.paging.isEnd) {
      openEnd(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, ClASS_END);
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
    removeByBox(dom(`#${ID_CTZ_COMMENT} .ctz-comment-content`)!, CLASS_LOADING);
    if (res.paging.isEnd) {
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
    domById(ID_CTZ_COMMENT_CHILD)!.addEventListener('click', (event) => {
      const nodeCurrent = event.target as HTMLElement;
      if (nodeCurrent.id === ID_CTZ_COMMENT_BACK) {
        dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!.scrollTop = 0;
        domById(ID_CTZ_COMMENT_CHILD)!.style.display = 'none';
      }

      eventVoteUp(nodeCurrent);
    });

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
    const nodeComment = domById(ID_CTZ_COMMENT_CHILD)!;
    const parentCommentHTML = parentData ? createCommentHTMLItem(parentData, false, false) : '';
    nodeComment.querySelector(QUERY_LIST)!.innerHTML =
      parentCommentHTML + `<div class="ctz-comment-child-count">${res.paging.totals} 条回复</div>` + createCommentHTML(res.data);
    removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, ClASS_END);
    removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, CLASS_LOADING);
    nodeComment.style.display = 'flex';
    this.page = res.paging;
    this.commentData = res.data;
    if (res.paging.isEnd) {
      openEnd(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, ClASS_END);
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
    removeByBox(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, CLASS_LOADING);
    if (res.paging.isEnd) {
      openEnd(dom(`#${ID_CTZ_COMMENT_CHILD} .ctz-comment-content`)!, ClASS_END);
    }
  },
};

const createCommentHTML = (data: ICommentData[], isChild = false) => data.map((i) => createCommentHTMLItem(i, isChild)).join('');

const createCommentHTMLItem = (item: ICommentData, isChild = false, haveChild = true): string => {
  const { author, id, authorTag, content, createdTime, hot, likeCount, childComments = [], childCommentCount, childCommentNextOffset, replyToAuthor } = item;
  const vDomContent = domC('div', { innerHTML: content });
  vDomContent.querySelectorAll('.comment_img').forEach((i) => {
    const nItem = i as HTMLAnchorElement;
    const nImage = domC('img', {
      src: nItem.href,
      style: ' margin: 12px 0px 0px; display:block:width: 100px; height: 200px;',
    });
    nItem.insertAdjacentElement('afterend', nImage);
    nItem.style.display = 'none';
  });
  const contentHTML = vDomContent.innerHTML;
  vDomContent.remove();
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
      <div class="ctz-ci-content">${contentHTML}</div>
      <div class="ctz-ci-info">
        <div class="ctz-ci-info-left">
          <span>${timeFormatter(+`${createdTime}000`, 'YYYY-MM-DD')}</span>
          ${hot ? '<span style="color: rgb(255, 150, 7);font-weight:bold;">热评</span>' : ''}
        </div>
        <div class="ctz-ci-info-right">
          <span class="${CLASS_VOTE} ${item.liked ? CLASS_VOTE_UP : ''}" data-id="${id}">❤︎ <span>${likeCount}</span></span>
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
