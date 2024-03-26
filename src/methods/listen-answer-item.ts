import { fnHiddenDom, fnIndexMath } from '../commons/math-for-my-listens';
import { myStorage } from '../commons/storage';
import { dom, domA } from '../commons/tools';
import { HIDDEN_ANSWER_ACCOUNT, HIDDEN_ANSWER_TAG } from '../configs';
import { IMyElement, IMyListenAnswerItem, IZhihuCardContent, IZhihuDataZop } from '../types';
import { addAnswerCopyLink } from './link';
import { updateItemTime } from './time';

/** 监听详情回答 - 过滤 */
export const myListenAnswerItem: IMyListenAnswerItem = {
  index: 0,
  init: async function () {
    const conf = await myStorage.getConfig();
    const {
      releaseTimeForAnswer,
      removeLessVoteDetail,
      lessVoteNumberDetail = 0,
      answerOpen,
      removeZhihuOfficial,
      removeBlockUserContent,
      removeBlockUserContentList,
      showBlockUser,
      removeAnonymousAnswer,
      topExportContent,
      blockWordsAnswer = [],
      fetchInterceptStatus,
      answerItemCreatedAndModifiedTime,
    } = conf;

    /** 添加功能 */
    const addFnInNodeItem = (nodeItem?: IMyElement, initThis?: any) => {
      if (!nodeItem) return;
      releaseTimeForAnswer && updateItemTime(nodeItem);
      addAnswerCopyLink(nodeItem);
    };

    addFnInNodeItem(dom('.QuestionAnswer-content'));
    const hiddenTags = Object.keys(HIDDEN_ANSWER_TAG);
    // 屏蔽用户名称列表
    let hiddenUsers = [];
    for (let i in HIDDEN_ANSWER_ACCOUNT) {
      conf[i] && hiddenUsers.push(HIDDEN_ANSWER_ACCOUNT[i]);
    }

    const elements = domA('.Question-main .List-item');
    let lessNum = 0;
    for (let i = this.index, len = elements.length; i < len; i++) {
      let message = '';
      const nodeItem = elements[i];
      const nodeItemContent = nodeItem.querySelector('.ContentItem');
      if (!nodeItemContent) continue;
      let dataZop: IZhihuDataZop = {};
      let dataCardContent: IZhihuCardContent = {}; // 回答扩展信息
      try {
        dataZop = JSON.parse(nodeItemContent.getAttribute('data-zop') || '{}');
        dataCardContent = JSON.parse(nodeItemContent.getAttribute('data-za-extra-module') || '{}').card.content;
      } catch {}

      // 屏蔽知乎官方账号回答
      if (removeZhihuOfficial && !message) {
        const labelE = nodeItem.querySelector('.AuthorInfo-name .css-n99yhz');
        const label = labelE ? labelE.getAttribute('aria-label') || '' : '';
        /知乎[\s]*官方帐号/.test(label) && (message = '已删除一条知乎官方帐号的回答');
      }

      // 屏蔽带有选中标签的回答
      let isHiddenTag = false;
      hiddenTags.forEach((i) => conf[i] && (isHiddenTag = true));
      if (isHiddenTag && !message) {
        const nodeTag1 = nodeItem.querySelector('.KfeCollection-AnswerTopCard-Container') as IMyElement;
        const nodeTag2 = nodeItem.querySelector('.LabelContainer-wrapper') as IMyElement;
        const text1 = nodeTag1 ? nodeTag1.innerText : '';
        const text2 = nodeTag2 ? nodeTag2.innerText : '';
        const tagText = text1 + text2;
        hiddenTags.forEach((i) => {
          if (conf[i]) {
            const nReg = new RegExp(HIDDEN_ANSWER_TAG[i]);
            nReg.test(tagText) && (message = `已删除一条标签${HIDDEN_ANSWER_TAG[i]}的回答`);
          }
        });
      }
      // 屏蔽用户 | 知乎账号的回答
      hiddenUsers.length && !message && hiddenUsers.includes(dataZop.authorName || '') && (message = `已删除${dataZop.authorName}的回答`);

      // 屏蔽「匿名用户」回答
      if (removeAnonymousAnswer && !message) {
        const userName = (nodeItem.querySelector('[itemprop="name"]') as IMyElement).content;
        userName === '匿名用户' && (message = `已屏蔽一条「匿名用户」回答`);
      }

      // fnJustNum(nodeItem, conf);

      if (message) {
        // 最后信息 & 起点位置处理
        lessNum = fnHiddenDom(lessNum, nodeItem, message);
      } else {
        addFnInNodeItem(nodeItem, this);
      }

      this.index = fnIndexMath(this.index, i, len, lessNum);
    }
  },
  reset: function () {
    this.index = 0;
  },
  restart: function () {
    this.reset();
    this.init();
  },
};
