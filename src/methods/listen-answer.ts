import { commonRequest, formatDataToHump } from '../commons/request';
import { myStorage } from '../commons/storage';
import { dom, domA, domById, nodesStopPropagation } from '../commons/tools';
import { store } from '../store';
import { IConfig } from '../types';
import { IZhihuAnswerDataItem, IZhihuAnswerResponse } from '../types/zhihu-answer.type';
import {
  CLASS_BTN_CLOSE,
  addListenImage,
  createHTMLCopyLink,
  eventListenButton,
  innerHTMLContentItemMeta,
  innerHTMLRichInnerAndAction,
  openEnd,
  openLoading,
  removeByBox,
} from './listen-common';

/** 新的回答内容监听，用于处理移动端网页 */
export const myListenAnswer = {
  next: '',
  end: false,
  loading: false,
  init: async function () {
    const config = await myStorage.getConfig();
    dom('.Question-main')!.addEventListener('click', (event: MouseEvent) => {
      eventListenButton(event);
    });
    nodesStopPropagation(['.RichContent-inner', '.Question-main figure img', '.Question-main a'], [addListenImage]);
    nodesStopPropagation(['.RichContent-inner p'], [], 'copy'); // 去除禁止复制
    const nodeJsonData = domById('js-initialData')!;
    if (!nodeJsonData) {
      unsafeWindow.ctzLog('cannot find script #js-initialData answer');
      return;
    }
    const pageJsData = JSON.parse(nodeJsonData.innerText || '{}');
    const questionId = location.pathname.replace('/question/', '');
    const currentQuestion = pageJsData.initialState.question.answers[questionId];
    if (currentQuestion) {
      const next = currentQuestion.next;
      this.next = next;
      this.end = !next;
    }
    // 页面原有的回答数据
    const prevAnswers = pageJsData.initialState.entities.answers;
    const prevDataList = Object.keys(prevAnswers).map((i) => ({
      target: formatDataToHump(prevAnswers[i]),
      targetType: 'answer',
    }));
    const topCurrentData = prevDataList.pop();
    if (!topCurrentData) return;

    const nodeQuestionAnswerContent = dom('.QuestionAnswer-content');
    if (nodeQuestionAnswerContent) {
      // 为列表跳转进来的当前回答
      nodeQuestionAnswerContent.innerHTML = createListItemHTML(topCurrentData, config);
    } else {
      const nodeTopList = dom('.List .List')!;
      nodeTopList.innerHTML = createListItemHTML(topCurrentData, config);
      const nodeLists = domA('.Question-main .List')!;
      const nodeListContent = nodeLists[nodeLists.length - 1];
      nodeListContent.innerHTML = createListHTML(prevDataList, config);
      this.checkListHeight();
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
    const nRes = formatDataToHump(res);
    const { paging, data } = nRes as IZhihuAnswerResponse;
    if (paging.next === this.next) return;
    this.end = paging.isEnd;
    this.next = paging.next;
    const config = await myStorage.getConfig();
    nodeListContent.innerHTML += createListHTML(data, config);
    paging.isEnd && openEnd(nodeListContent, 'ctz-answer-end');
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

const createListHTML = (data: IZhihuAnswerDataItem[], config: IConfig) => data.map((i) => createListItemHTML(i, config)).join('');

const createListItemHTML = (data: IZhihuAnswerDataItem, config: IConfig) => {
  const { releaseTimeForAnswer, copyAnswerLink } = config;
  const { targetType, target } = data;
  const { hiddenTags, hiddenUsers } = store.getHidden();
  const answerTopCard = [];
  target.labelInfo && answerTopCard.push(`本回答节选自${target.labelInfo.text}`);
  target.rewardInfo.isRewardable && answerTopCard.push('内容包含虚构创作');

  for (let i = 0, len = hiddenTags.length; i < len; i++) {
    if (answerTopCard.join().includes(hiddenTags[i])) return '';
  }
  for (let i = 0, len = hiddenUsers.length; i < len; i++) {
    if (target.author.name === hiddenUsers[i]) return '';
  }

  let extraHTML = '';
  copyAnswerLink && (extraHTML += createHTMLCopyLink(`https://www.zhihu.com/question/${target.question.id}/answer/${target.id}`));

  return `
<div class="List-item ctz-answer-item" tabindex="0">
  <div
    class="ContentItem AnswerItem ctz-self-item"
    data-za-index="0"
    data-zop='{"authorName":"${target.author.name}","itemId":${target.id},"title":"${target.question.title}","type":"${targetType}"}'
    name="${target.id}"
    itemprop="suggestedAnswer"
    itemtype="http://schema.org/Answer"
    itemscope=""
    data-za-detail-view-path-module="AnswerItem"
    data-za-detail-view-path-index="0"
    data-za-extra-module='{"card":{"has_image":false,"has_video":false,"content":{"type":"${targetType}","token":"${target.id}","upvote_num":${
    target.voteupCount
  },"comment_num":${target.commentCount},"publish_timestamp":null,"parent_token":"${target.question.id}","author_member_hash_id":"${target.author.id}"}}}'
  >
    ${innerHTMLContentItemMeta(data,  {
      haveTime: releaseTimeForAnswer,
      extraHTML,
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
