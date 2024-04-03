import { commonRequest } from '../commons/request';
import { myStorage } from '../commons/storage';
import { dom, domA, domById, domC, domP, fnLog, nodesStopPropagation } from '../commons/tools';
import { store } from '../store';
import { IConfig } from '../types';
import { IZhihuAnswerDataItem, IZhihuAnswerResponse } from '../types/zhihu-answer.type';
import {
  CLASS_BTN_CLOSE,
  CLASS_BTN_COMMENT,
  CLASS_BTN_EXPEND,
  addListenImage,
  eventListenButton,
  innerHTMLContentItemMeta,
  innerHTMLRichInnerAndAction,
  openEnd,
  openLoading,
  removeByBox,
} from './listen-common';
import { updateItemTime } from './time';

/** 新的回答内容监听，用于处理移动端网页 */
export const myListenAnswer = {
  next: '',
  end: false,
  loading: false,
  init: function () {
    dom('.Question-main')!.addEventListener('click', (event: MouseEvent) => {
      eventListenButton(event);
    });
    nodesStopPropagation(['.RichContent-inner', '.Question-main figure img', '.Question-main a'], [addListenImage]);
    nodesStopPropagation(['.RichContent-inner p'], [], 'copy'); // 去除禁止复制
    this.formatInitAnswers();
    const nodeJsonData = domById('js-initialData')!;
    if (!nodeJsonData) {
      fnLog('cannot find script #js-initialData');
      return;
    }
    const pageJsData = JSON.parse(nodeJsonData.innerText || '{}');
    const questionId = location.pathname.replace('/question/', '');
    const currentQuestion = pageJsData.initialState.question.answers[questionId];
    if (!currentQuestion) return;
    const next = currentQuestion.next;
    this.next = next;
    this.end = !next;
  },
  /** 处理初始页面数据 */
  formatInitAnswers: async function () {
    const { releaseTimeForAnswer } = await myStorage.getConfig();
    const nodeAnswers = domA('.ContentItem.AnswerItem:not(.ctz-self-item)');
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
        const nodeUsername = nodeItem.querySelector('.AuthorInfo-head .UserLink-link');
        const username = nodeUsername ? (nodeUsername as HTMLElement).innerText : '';
        for (let indexName = 0, lenName = hiddenUsers.length; indexName < lenName; indexName++) {
          if (hiddenUsers[indexName] === username) {
            domP(nodeItem, 'class', 'List-item')!.style.display = 'none';
            check();
            return;
          }
        }

        releaseTimeForAnswer && updateItemTime(nodeItem);
        check();

        // 添加评论按钮
        const count = (nodeItem.querySelector('[itemprop="commentCount"]') as HTMLMetaElement).content;
        const nCommentBtn = cDomCommentBtn(count);
        nodeActions && nodeActions.appendChild(nCommentBtn);

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
          nodeActions && nodeActions.appendChild(nCloseButton);
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
    openLoading(nodeListContent, 'ctz-answer-loading');
    const res = await commonRequest(this.next);
    removeByBox(nodeListContent, 'ctz-answer-loading');
    this.loading = false;
    if (!res) return;
    const { paging, data } = res as IZhihuAnswerResponse;
    if (paging.next === this.next) return;
    this.end = paging.is_end;
    this.next = paging.next;
    const config = await myStorage.getConfig();
    nodeListContent.innerHTML += createListHTML(data, config);
    paging.is_end && openEnd(nodeListContent, 'ctz-answer-end');
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

/** 创建元素：评论按钮 */
const cDomCommentBtn = (count: string | number = 0) => {
  return domC('button', {
    className: `${CLASS_BTN_COMMENT} Button Button--plain Button--withIcon Button--withLabel`,
    innerHTML: `评论 ${count}`,
  });
};

const createListHTML = (data: IZhihuAnswerDataItem[], config: IConfig) => data.map((i) => createListItemHTML(i, config)).join('');

const createListItemHTML = (data: IZhihuAnswerDataItem, config: IConfig) => {
  const { releaseTimeForAnswer } = config;
  const { target_type, target } = data;
  const { hiddenTags, hiddenUsers } = store.getHidden();

  const answerTopCard = [];
  target.label_info && answerTopCard.push(`本回答节选自${target.label_info.text}`);
  target.reward_info.is_rewardable && answerTopCard.push('内容包含虚构创作');

  for (let i = 0, len = hiddenTags.length; i < len; i++) {
    if (answerTopCard.join().includes(hiddenTags[i])) return '';
  }
  for (let i = 0, len = hiddenUsers.length; i < len; i++) {
    if (target.author.name === hiddenUsers[i]) return '';
  }

  return `
<div class="List-item ctz-answer-item" tabindex="0">
  <div
    class="ContentItem AnswerItem ctz-self-item"
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
    ${innerHTMLContentItemMeta(data, {
      haveTime: releaseTimeForAnswer,
    })}
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
    ${innerHTMLRichInnerAndAction(data)}
  </div>
</div>`;
};
