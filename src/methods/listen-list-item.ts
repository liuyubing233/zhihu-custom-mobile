import { fnHiddenDom } from '../commons/math-for-my-listens';
import { myStorage } from '../commons/storage';
import { domA, domP } from '../commons/tools';
import { IZhihuCardContent, IZhihuDataZop } from '../types';

/** 监听列表内容 - 过滤  */
export const myListenListItem = {
  index: 0,
  init: async function () {
    // const pfConfig = await myStorage.getConfig();
    // const {} = pfConfig;
    const elements = domA('.TopstoryItem').length ? domA('.TopstoryItem') : domA('.List-item');
    let lessNum = 0;
    const pfHistory = await myStorage.getHistory();
    const historyList = pfHistory.list;
    for (let i = this.index, len = elements.length; i < len; i++) {
      let message = ''; // 屏蔽信息
      let dataZop: IZhihuDataZop = {};
      let cardContent: IZhihuCardContent = {};
      const nodeItem = elements[i];
      const nodeItemContent = nodeItem.querySelector('.ContentItem');
      if (!nodeItem.scrollHeight || !nodeItemContent) continue;
      /** 问题 */
      const isAnswer = nodeItemContent.classList.contains('AnswerItem');
      /** 视频 */
      const isVideo = nodeItemContent.classList.contains('ZVideoItem');
      /** 文章 */
      const isArticle = nodeItemContent.classList.contains('ArticleItem');
      /** 想法 */
      const isTip = nodeItemContent.classList.contains('PinItem');
      try {
        dataZop = JSON.parse(nodeItemContent.getAttribute('data-zop') || '{}');
        cardContent = JSON.parse(nodeItemContent.getAttribute('data-za-extra-module') || '{}').card.content;
      } catch {}
      // 最后信息 & 起点位置处理
      message && (lessNum = fnHiddenDom(lessNum, nodeItem, message));
      // 缓存推荐列表
      const nodeATitle = nodeItem.querySelector('.ContentItem-title a') as HTMLAnchorElement;
      if ((domP(nodeItem, 'class', 'TopstoryMain') || domP(nodeItem, 'class', 'NotLoggedInTopstory')) && nodeATitle) {
        if (nodeATitle) {
          const itemHref = nodeATitle.href;
          const bType = isAnswer
            ? `<b class="c-ec7259">「问题」</b>`
            : isArticle
            ? `<b class="c-00965e">「文章」</b>`
            : isVideo
            ? `<b class="c-12c2e9">「视频」</b>`
            : isTip
            ? `<b class="c-9c27b0">「想法」</b>`
            : '';
          const itemA = `<a href="${itemHref}" target="_blank">${bType + nodeATitle.innerText}</a>`;
          !historyList.includes(itemA) && historyList.unshift(itemA);
        }
      }
      if (i + 1 === len) {
        const nI = i - lessNum >= 0 ? i - lessNum : 0;
        this.index = nI;
        myStorage.setHistoryItem('list', historyList);
      }
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
