import { commonRequest } from '../commons/request';
import { myStorage } from '../commons/storage';
import { dom, domA, domById, domC, domP, fnLog } from '../commons/tools';
import { store } from '../store';
import { IConfig, IMyElement, IZhihuDataZop } from '../types';
import { IZhihuAnswerDataItem, IZhihuAnswerResponse } from '../types/zhihu-answer.type';
import { myListenComment } from './listen-comment';
import { myPreview } from './preview';

/** 自定义展开按钮类名 */
const CLASS_BTN_EXPEND = 'ctz-n-button-expend';
/** 自定义收起按钮类名 */
const CLASS_BTN_CLOSE = 'ctz-n-button-close';
/** 自定义评论按钮类名 */
const CLASS_BTN_COMMENT = 'ctz-n-button-comment';

/**
 * 新的回答内容监听，用于处理移动端网页
 * 旧文件后续删除（./listen-answer-item.ts）
 */
export const myListenAnswer = {
  next: '',
  end: false,
  loading: false,
  init: async function () {
    dom('.Question-main')!.addEventListener('click', eventListenerQuestionMain);
    nodesStopPropagation(['.RichContent-inner', '.Question-main figure img', '.Question-main a']);
    this.formatInitAnswers();
    const nodeJsonData = domById('js-initialData');
    if (!nodeJsonData) {
      fnLog('cannot find script #js-initialData');
      return;
    }
    const pageJsData = JSON.parse(nodeJsonData.innerText || '{}');
    const questionId = location.pathname.replace('/question/', '');
    const currentQuestion = pageJsData.initialState.question.answers[questionId];
    if (!currentQuestion) return;
    const next = pageJsData.initialState.question.answers[questionId].next;
    this.next = next;
    this.end = !next;
  },
  /** 处理初始页面数据 */
  formatInitAnswers: async function () {
    const nodeAnswers = domA('.ContentItem.AnswerItem');
    const { hiddenTags, hiddenUsers } = store.getHidden();

    for (let i = 0, len = nodeAnswers.length; i < len; i++) {
      const nodeItem = nodeAnswers[i];
      const nodeRich = nodeItem.querySelector('.RichContent') as HTMLElement;
      const nodeActions = nodeItem.querySelector('.ContentItem-actions') as HTMLElement;
      setTimeout(() => {
        const check = () => {
          len === i + 1 && this.checkListHeight();
        };

        // 过滤标签
        const nodeAnswerTopCard = nodeItem.querySelector('.KfeCollection-AnswerTopCard-Container') as HTMLElement | null;
        const nodeAnswerLabel = nodeItem.querySelector('.LabelContainer-wrapper') as HTMLElement | null;
        const topCardInnerText = nodeAnswerTopCard ? nodeAnswerTopCard.innerText : '';
        const topLabelInnerText = nodeAnswerLabel ? nodeAnswerLabel.innerText : '';
        for (let indexTag = 0, lenTag = hiddenTags.length; indexTag < lenTag; indexTag++) {
          const itemTag = hiddenTags[indexTag];
          if (topCardInnerText.includes(itemTag) || topLabelInnerText.includes(itemTag)) {
            domP(nodeItem, 'class', 'List-item')!.style.display = 'none';
            check();
            return;
          }
        }

        // 过滤用户名
        const username = (nodeItem.querySelector('.AuthorInfo-head .UserLink-link') as HTMLElement).innerText;
        for (let indexName = 0, lenName = hiddenUsers.length; indexName < lenName; indexName++) {
          if (hiddenUsers[indexName] === username) {
            domP(nodeItem, 'class', 'List-item')!.style.display = 'none';
            check();
          }
        }

        check();

        // 添加评论按钮
        const count = (nodeItem.querySelector('[itemprop="commentCount"]') as HTMLMetaElement).content;
        const nCommentBtn = cDomCommentBtn(count);
        nodeActions.appendChild(nCommentBtn);

        // 添加自定义的展开、收起按钮
        if (nodeRich.classList.contains('is-collapsed')) {
          const nExpendButton = domC('button', {
            innerHTML: '展开更多 ▼',
            className: CLASS_BTN_EXPEND,
          });
          const nCloseButton = domC('button', {
            innerHTML: '收起 ▲',
            className: `${CLASS_BTN_CLOSE} Button`,
            style: 'display: none;',
          });
          nodeRich.appendChild(nExpendButton);
          nodeActions.appendChild(nCloseButton);
        }
      }, 1000);
    }
  },
  /** 滚动时回答内容处理 */
  scroll: async function () {
    const nodeAnswers = domA('.ContentItem.AnswerItem');
    const windowHeight = window.innerHeight;
    for (let i = 0, len = nodeAnswers.length; i < len; i++) {
      // 悬浮底部操作栏
      const nodeItem = nodeAnswers[i];
      const nodeClose = nodeItem.querySelector(`.${CLASS_BTN_CLOSE}`) as HTMLElement | null;
      if (!nodeClose || nodeClose.style.display === 'none') continue;
      const bounding = nodeItem.getBoundingClientRect();
      const nodeActions = nodeItem.querySelector('.ContentItem-actions') as HTMLElement;
      if (bounding.bottom < windowHeight || bounding.top > windowHeight) {
        if (nodeActions.style.cssText) {
          nodeActions.style.cssText = '';
        }
        continue;
      }
      nodeActions.style.cssText += `position: fixed; bottom: 0; left: 0; width: 100%!important; margin: 0;box-shadow: 0 -1px 3px rgba(25,27,31,0.1);`;
    }
    const nodeLists = domA('.Question-main .List');
    if (!nodeLists.length) return;
    const nodeListContent = nodeLists[nodeLists.length - 1];
    const bounding = nodeListContent.getBoundingClientRect();
    if (bounding.bottom - 200 <= window.innerHeight && !this.end && !this.loading) {
      this.requestData(nodeListContent);
    }
  },
  requestData: async function (nodeListContent: HTMLElement) {
    this.loading = true;
    openLoading(nodeListContent);
    const res = await commonRequest(this.next);
    if (!res) return;
    const { paging, data } = res as IZhihuAnswerResponse;
    if (paging.next === this.next) return;
    paging.is_end && openEnd(nodeListContent);
    this.end = paging.is_end;
    this.next = paging.next;
    const config = await myStorage.getConfig();
    nodeListContent.innerHTML += createListHTML(data, config);
    hideLoading(nodeListContent);
    this.loading = false;
    this.checkListHeight();
  },
  /** 检测元素高度 */
  checkListHeight: function () {
    const nodeLists = domA('.Question-main .List');
    if (!nodeLists.length) return;
    const nodeListContent = nodeLists[nodeLists.length - 1];
    if (nodeListContent.offsetHeight < window.innerHeight) {
      this.requestData(nodeListContent);
    }
  },
};

const openLoading = (box: HTMLElement) => {
  if (box.querySelector('.ctz-answer-loading')) return;
  const nNode = domC('div', {
    innerHTML: '<span>↻</span>',
    className: 'ctz-answer-loading',
  });
  box.appendChild(nNode);
};

const hideLoading = (box: HTMLElement) => {
  const nodeFind = box.querySelector('.ctz-answer-loading');
  nodeFind && nodeFind.remove();
};

const openEnd = (box: HTMLElement) => {
  if (box.querySelector('.ctz-answer-end')) return;
  const nNode = domC('div', {
    innerText: '----- 没有更多了 -----',
    className: 'ctz-answer-end',
  });
  box.appendChild(nNode);
};

const eventQuestionMain: Record<string, Function> = {
  /** 展开更多 */
  [CLASS_BTN_EXPEND]: (currentNode: HTMLElement) => {
    const nodeRich = domP(currentNode, 'class', 'RichContent')!;
    const nodeRichInner = nodeRich.querySelector('.RichContent-inner') as HTMLElement;
    const nodeBTNOther = nodeRich.querySelector(`.${CLASS_BTN_CLOSE}`) as HTMLElement;
    const nodeImgs = nodeRichInner.querySelectorAll('img');
    for (let i = 0, len = nodeImgs.length; i < len; i++) {
      const item = nodeImgs[i];
      item.src = item.getAttribute('data-original') || '';
    }
    nodeRich.classList.remove('is-collapsed');
    nodeRichInner.style.maxHeight = 'max-content';
    nodeBTNOther.style.display = 'block';
    currentNode.style.display = 'none';
  },
  /** 收起 */
  [CLASS_BTN_CLOSE]: (currentNode: HTMLElement) => {
    const nodeRich = domP(currentNode, 'class', 'RichContent')!;
    const nodeRichInner = nodeRich.querySelector('.RichContent-inner') as HTMLElement;
    const nodeBTNOther = nodeRich.querySelector(`.${CLASS_BTN_EXPEND}`) as HTMLElement;
    const nodeActions = nodeRich.querySelector('.ContentItem-actions') as HTMLElement;
    nodeActions.style.cssText = '';
    nodeRich.classList.add('is-collapsed');
    nodeRichInner.style.maxHeight = '180px';
    nodeBTNOther.style.display = 'block';
    currentNode.style.display = 'none';
  },
  /** 评论 */
  [CLASS_BTN_COMMENT]: async (currentNode: HTMLElement) => {
    const nodeAnswerItem = domP(currentNode, 'class', 'AnswerItem')!;
    const dataZopJson = nodeAnswerItem.getAttribute('data-zop') || '{}';
    const dataZop: IZhihuDataZop = JSON.parse(dataZopJson);
    myListenComment.create(dataZop.itemId);
  },
};

/** 监听问答详情最顶层 */
const eventListenerQuestionMain = (event: MouseEvent) => {
  const target = event.target as IMyElement;
  addListenImage(event);
  Object.keys(eventQuestionMain).forEach((key) => {
    if (target.classList.contains(key)) {
      event.preventDefault();
      event.stopPropagation();
      eventQuestionMain[key](target);
    }
  });
};

/** 监听图片操作 */
const addListenImage = (event: MouseEvent) => {
  const target = event.target as IMyElement;
  if (target.nodeName === 'IMG') {
    let src = target.src;
    if (target.classList.contains('ztext-gif')) {
      // 动图
      src = src.replace('.jpg', '.webp');
    }
    myPreview.open(src);
    return;
  }
};

/** 批量阻止事件传递 & 添加自定义方法 */
const nodesStopPropagation = (classNames: string[]) => {
  let nodeArray: HTMLElement[] = [];
  classNames.forEach((item) => {
    nodeArray = nodeArray.concat(Array.prototype.slice.call(domA(item)));
  });
  for (let i = 0, len = nodeArray.length; i < len; i++) {
    nodeArray[i].addEventListener('click', (event) => {
      event.stopPropagation();
      addListenImage(event);
    });
  }
};

/** 创建元素：评论按钮 */
const cDomCommentBtn = (count: string | number = 0) => {
  return domC('button', {
    className: `${CLASS_BTN_COMMENT} Button Button--plain Button--withIcon Button--withLabel`,
    innerHTML: `评论 ${count}`,
  });
};

const createListHTML = (data: IZhihuAnswerDataItem[], config: IConfig) => data.map((i) => createListItemHTML(i, config)).join('');

const createListItemHTML = (data: IZhihuAnswerDataItem, config: IConfig) => {
  const { target_type, target } = data;
  const { hiddenTags, hiddenUsers } = store.getHidden();
  const questionId = location.pathname.replace('/question/', '');
  const isMore = target.content.length > 400;
  const vDomContent = domC('div', { innerHTML: target.content });
  vDomContent.querySelectorAll('img').forEach((item) => {
    item.src = item.getAttribute('data-original') || '';
  });
  vDomContent.querySelectorAll('a.video-box').forEach((item) => {
    const nItem = item as HTMLAnchorElement;
    const nFrame = domC('iframe', {
      style: `border:none;width: calc(100vw - 32px);height: calc((100vw - 32px)/1.8);`,
      src: nItem.href,
    });
    nItem.insertAdjacentElement('afterend', nFrame);
    nItem.style.display = 'none';
  });
  const contentHTML = vDomContent.innerHTML;
  vDomContent.remove();

  const answerTopCard = [];
  target.label_info && answerTopCard.push(`本回答节选自${target.label_info.text}`);
  target.reward_info.is_rewardable && answerTopCard.push('内容包含虚构创作');

  for (let i = 0, len = hiddenTags.length; i < len; i++) {
    if (answerTopCard.join().includes(hiddenTags[i])) return '';
  }
  for (let i = 0, len = hiddenUsers.length; i < len; i++) {
    if (target.author.name === hiddenUsers[i]) return '';
  }

  return `<div class="List-item ctz-answer-item" tabindex="0">
  <div
    class="ContentItem AnswerItem"
    data-za-index="0"
    data-zop='{"authorName":"${target.author.name}","itemId":${target.id},"title":"${target.question.title}","type":"${target_type}"}'
    name="${target.id}"
    itemprop="suggestedAnswer"
    itemtype="http://schema.org/Answer"
    itemscope=""
    data-za-detail-view-path-module="AnswerItem"
    data-za-detail-view-path-index="0"
    data-za-extra-module='{"card":{"has_image":false,"has_video":false,"content":{"type":"${target_type}","token":"${target.id}","upvote_num":${
    target.voteup_count
  },"comment_num":${target.comment_count},"publish_timestamp":null,"parent_token":"${target.question.id}","author_member_hash_id":"${target.author.id}"}}}'
  >
    <div class="ContentItem-meta">
      <div class="AuthorInfo AnswerItem-authorInfo AnswerItem-authorInfo--related" itemprop="author" itemscope="" itemtype="http://schema.org/Person">
        <div class="AuthorInfo AuthorInfo--mobile">
          <meta itemprop="name" content="${target.author.name}" />
          <meta itemprop="image" content="${target.author.avatar_url}" />
          <meta itemprop="url" content="https://www.zhihu.com/people/${target.author.id}" />
          <meta itemprop="zhihu:followerCount" content="${target.author.follower_count}" />
          <span class="UserLink AuthorInfo-avatarWrapper">
            <a href="//www.zhihu.com/people/${target.author.id}" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">
              <img class="Avatar AuthorInfo-avatar" src="${target.author.avatar_url}" srcset="${target.author.avatar_url} 2x" alt="${target.author.name}" />
            </a>
          </span>
          <div class="AuthorInfo-content">
            <div class="AuthorInfo-head">
              <span class="UserLink AuthorInfo-name">
                <a href="//www.zhihu.com/people/${target.author.id}" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">
                  ${target.author.name}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${
      answerTopCard.length
        ? `<div class="KfeCollection-AnswerTopCard-Container">` +
          answerTopCard
            .map(
              (i) =>
                `<div class="KfeCollection-OrdinaryLabel-newStyle-mobile" style="margin-right: 6px;">` +
                `<div class="KfeCollection-OrdinaryLabel-content">${i}</div>` +
                `</div>`
            )
            .join('') +
          `</div>`
        : ''
    }
    <meta itemprop="image" />
    <meta itemprop="upvoteCount" content="${target.voteup_count}" />
    <meta itemprop="url" content="https://www.zhihu.com/question/${questionId}/answer/${target.id}" />
    <meta itemprop="dateCreated" content="${target.created_time}000" />
    <meta itemprop="dateModified" content="${target.updated_time}000" />
    <meta itemprop="commentCount" content="${target.comment_count}" />
    <div class="RichContent ${isMore ? 'is-collapsed' : ''} RichContent--unescapable">
      <div class="RichContent-inner RichContent-inner--collapsed" style="${isMore ? 'max-height: 180px' : ''}">${contentHTML}</div>
      <div class="ContentItem-actions">
        <button aria-label="赞同 ${target.voteup_count}" aria-live="polite" type="button" class="Button VoteButton VoteButton--up">
          ▲ 赞同 ${target.voteup_count}
        </button>
        <button   aria-label="反对" aria-live="polite" type="button" class="Button VoteButton VoteButton--down VoteButton--mobileDown">
          ▼
        </button>
        <button class="ctz-n-button-comment Button Button--plain Button--withIcon Button--withLabel">评论 ${target.comment_count}</button>
        ${isMore ? '<button class="ctz-n-button-close Button" style="display: none">收起 ▲</button>' : ''}
      </div>
      ${isMore ? '<button class="ctz-n-button-expend">展开更多 ▼</button>' : ''}
    </div>
  </div>
</div>`;
};
