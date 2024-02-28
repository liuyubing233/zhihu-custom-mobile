import { fnHiddenDom, fnIndexMath } from '../commons/math-for-my-listens';
import { myStorage } from '../commons/storage';
import { dom, domA } from '../commons/tools';
import { IMyElement, IMyListenAnswerItem, IZhihuCardContent, IZhihuDataZop } from '../types';
import { addAnswerCopyLink } from './link';
import { updateItemTime } from './time';

/** 监听详情回答 - 过滤 */
export const myListenAnswerItem: IMyListenAnswerItem = {
  index: 0,
  init: async function () {
    const conf = await myStorage.getConfig();
    const { releaseTimeForAnswer } = conf;

    /** 添加功能 */
    const addFnInNodeItem = (nodeItem?: IMyElement, initThis?: any) => {
      if (!nodeItem) return;
      releaseTimeForAnswer && updateItemTime(nodeItem);
      addAnswerCopyLink(nodeItem);
    };

    addFnInNodeItem(dom('.QuestionAnswer-content'));
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
