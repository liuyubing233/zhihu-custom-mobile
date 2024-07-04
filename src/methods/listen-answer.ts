import { commonRequest, formatDataToHump, requestAnswer } from '../commons/request';
import { myStorage } from '../commons/storage';
import { dom, domA, domById, domC, fnLog, insertAfter, nodesStopPropagation } from '../commons/tools';
import { store } from '../store';
import { IConfig } from '../types';
import { IZhihuAnswerDataItem } from '../types/zhihu-answer.type';
import {
  CLASS_BTN_CLOSE,
  addListenImage,
  createHTMLCopyLink,
  innerHTMLContentItemMeta,
  innerHTMLRichInnerAndAction,
  openEnd,
  openLoading,
  removeByBox
} from './listen-common';

const CLASS_ANSWER_ITEM = 'ctz-answer-item';

/** 新的回答内容监听，用于处理移动端网页 */
export const myListenAnswer = {
  isUpdated: false,
  next: '',
  end: false,
  loading: false,
  init: async function () {
    this.isUpdated = /question\/\d+\/answers\/updated/.test(location.pathname);
    const nodeQuestionMain = dom('.Question-main');
    if (!nodeQuestionMain) {
      setTimeout(() => {
        fnLog('未找到 .Question-main, 等待重载...');
        myListenAnswer.init();
      }, 500);
      return;
    }
    const config = await myStorage.getConfig();
    const nodeJsonData = domById('js-initialData')!;
    if (!nodeJsonData) {
      return;
    }
    const pageJsData = JSON.parse(nodeJsonData.innerText || '{}');
    nodesStopPropagation(['.RichContent-inner', '.Question-main figure img', '.Question-main a'], [addListenImage]);
    nodesStopPropagation(['.RichContent-inner p'], [], 'copy'); // 去除禁止复制
    const nodeQuestionAnswerContent = dom('.QuestionAnswer-content');
    if (nodeQuestionAnswerContent) {
      // 为默认回答内容
      const locArr = location.pathname.split('/');
      const answerId = locArr[4];
      const res = await requestAnswer(answerId);
      if (!res) return;
      const nodeQuestionAnswerContent = dom('.QuestionAnswer-content')!;
      nodeQuestionAnswerContent.innerHTML = createListItemHTML({ target: res, targetType: 'answer' }, config);
      if (!dom('.Card.ViewAll')) {
        const questions = pageJsData.initialState.entities.questions;
        const question = questions[Object.keys(questions)[0]];
        const nNode = domC('div', {
          className: 'Card ViewAll ViewAll--bottom',
          innerHTML: `<a href="/question/${
            question.id
          }" class="QuestionMainAction ViewAll-QuestionMainAction" data-za-detail-view-element_name="ViewAll" style="color: rgb(23, 81, 153);">查看全部 ${
            question.answerCount || 0
          } 个回答</a>`,
        });
        nNode.setAttribute('data-za-detail-view-path-module', 'MessageItem');
        nNode.setAttribute('data-za-extra-module', `{&quot;card&quot;:{&quot;content&quot;:{&quot;item_num&quot;:${question.answerCount || 0}}}}`);
        insertAfter(nNode, nodeQuestionAnswerContent.parentElement);
      }
    } else {
      const matchArr = location.pathname.match(/question\/(\d+)\/?/);
      const questionId = matchArr && matchArr.length ? matchArr[1] : ''
      const currentQuestion = this.isUpdated
        ? pageJsData.initialState.question.updatedAnswers[questionId]
        : pageJsData.initialState.question.answers[questionId];
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
      if (this.isUpdated) {
        const prevListDom = dom('.List div:nth-of-type(2)');
        if (prevListDom) {
          prevListDom.style.display = 'none';
          dom('.List')!.appendChild(domC('div', { className: 'List' }));
        }
      }
      const nodeTopList = dom('.List .List');
      if (topCurrentData) {
        if (nodeTopList) {
          nodeTopList.innerHTML = createListItemHTML(topCurrentData, config);
          const nodeLists = domA('.Question-main .List')!;
          const nodeListContent = nodeLists[nodeLists.length - 1];
          if (prevDataList.length) {
            if (this.isUpdated) {
              nodeListContent.innerHTML += createListHTML(prevDataList, config);
            } else {
              nodeListContent.innerHTML = createListHTML(prevDataList, config);
            }
          }
        } else {
          fnLog('nodeTopList is undefined');
        }
      }
      this.checkListHeight();
    }

    setTimeout(() => {
      const nodeAnswers = domA('.List-item');
      if ((nodeAnswers.length && !nodeAnswers[0].classList.contains(CLASS_ANSWER_ITEM))) {
        fnLog('回答内容被覆盖，等待重载...');
        myListenAnswer.init();
      }
    }, 500);
  },
  /** 滚动时回答内容处理 */
  scroll: async function () {
    const nodeAnswers = domA('.ContentItem');
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
    if (this.end) return;
    this.loading = true;
    openLoading(nodeListContent, 'ctz-answer-loading');
    const res = await commonRequest(this.next);
    removeByBox(nodeListContent, 'ctz-answer-loading');
    this.loading = false;
    if (!res) return;
    fnLog(res);
    const { paging, data } = res;
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
  // target.rewardInfo.isRewardable && answerTopCard.push('内容包含虚构创作');

  for (let i = 0, len = hiddenTags.length; i < len; i++) {
    if (answerTopCard.join().includes(hiddenTags[i])) return '';
  }
  for (let i = 0, len = hiddenUsers.length; i < len; i++) {
    if (target.author.name === hiddenUsers[i]) return '';
  }
  let extraHTML = '';
  copyAnswerLink && (extraHTML += createHTMLCopyLink(`https://www.zhihu.com/question/${target.question.id}/answer/${target.id}`));

  return `
<div class="List-item ${CLASS_ANSWER_ITEM}" tabindex="0">
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
    ${innerHTMLContentItemMeta(data, {
      haveTime: releaseTimeForAnswer,
      extraHTML,
      config,
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
