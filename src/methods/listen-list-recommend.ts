import { commonRequest, formatDataToHump } from '../commons/request';
import { myStorage } from '../commons/storage';
import { dom, domById, fnLog } from '../commons/tools';
import { IConfig } from '../types';
import { IZhihuListRecommendResponse, IZhihuRecommendData, IZhihuRecommendDataTarget } from '../types/zhihu-list-response.type';
import { createHTMLCopyLink, eventListenButton, innerHTMLContentItemMeta, innerHTMLRichInnerAndAction, openLoading, removeByBox } from './listen-common';

/** 加载推荐列表 */
export const myListenListRecommend = {
  next: '',
  loading: false,
  init: async function () {
    const nodeTopStoryRecommend = dom('.TopstoryMain') || dom('.NotLoggedInTopstory');
    if (!nodeTopStoryRecommend) return;
    nodeTopStoryRecommend.addEventListener('click', async function (event) {
      eventListenButton(event);
    });

    const nodeJsonData = domById('js-initialData');
    const config = await myStorage.getConfig();
    if (!nodeJsonData) {
      return;
    }
    const pageJsData = JSON.parse(nodeJsonData.innerText || '{}');
    const next = pageJsData.initialState.topstory.recommend.next;
    this.next = next;
    const currentData = pageJsData.initialState.topstory.recommend.serverPayloadOrigin;
    if (!currentData) return;
    const nodeTopstoryMain = dom('.TopstoryMain');
    if (!nodeTopstoryMain) return;
    const nodeListContent = nodeTopstoryMain.querySelector('[role="list"]') as HTMLElement;
    // 替换原有数据
    nodeListContent.innerHTML = createListHTML(formatDataToHump(currentData.data), config);
  },
  scroll: function () {
    const nodeTopstoryMain = dom('.TopstoryMain');
    if (!nodeTopstoryMain) return;
    const bounding = nodeTopstoryMain.getBoundingClientRect();
    if (bounding.bottom - 200 <= window.innerHeight && !this.loading) {
      const nodeListContent = nodeTopstoryMain.querySelector('[role="list"]') as HTMLElement;
      this.requestData(nodeListContent);
    }
  },
  requestData: async function (nodeListContent: HTMLElement) {
    this.loading = true;
    openLoading(nodeListContent, 'ctz-list-loading');
    const res = await commonRequest(this.next);
    removeByBox(nodeListContent, 'ctz-list-loading');
    this.loading = false;
    if (!res) return;
    const nRes = formatDataToHump(res);
    fnLog(nRes)
    const { paging, data } = nRes as IZhihuListRecommendResponse;
    if (paging.next === this.next) return;
    this.next = paging.next;
    const config = await myStorage.getConfig();
    nodeListContent.innerHTML += createListHTML(data, config);
    this.checkListHeight();
  },
  checkListHeight: function () {
    const nodeTopstoryMain = dom('.TopstoryMain');
    if (!nodeTopstoryMain) return;
    if (nodeTopstoryMain.offsetHeight < window.innerHeight) {
      const nodeListContent = nodeTopstoryMain.querySelector('[role="list"]') as HTMLElement;
      this.requestData(nodeListContent);
    }
  },
};

const addHistoryItem = async (data: IZhihuRecommendData) => {
  const { target } = data;
  const type = target.type as IItemType;
  const { name, bTypeClass, formatData } = itemType[type];
  const pfHistory = await myStorage.getHistory();
  const historyList = pfHistory.list;
  const { itemHref2, itemTitle } = formatData(target);
  let bType = `<b class="${bTypeClass}">「${name}」</b>`;
  const itemA = `<a href="${itemHref2}" target="_blank">${bType + itemTitle}</a>`;
  !historyList.includes(itemA) && historyList.unshift(itemA);
  myStorage.setHistoryItem('list', historyList);
};

const itemType = {
  answer: {
    name: '问题',
    bTypeClass: 'c-ec7259',
    contentItem: 'AnswerItem',
    nType: 'Answer',
    formatData: (target: IZhihuRecommendDataTarget) => {
      return {
        itemTitle: target.question.title,
        itemHref: `https://www.zhihu.com/question/${target.question.id}`,
        itemHref2: `https://www.zhihu.com/question/${target.question.id}/answer/${target.id}`,
      };
    },
  },
  article: {
    name: '文章',
    bTypeClass: 'c-00965e',
    contentItem: 'ArticleItem',
    nType: 'Post',
    formatData: (target: IZhihuRecommendDataTarget) => {
      return {
        itemTitle: target.title,
        itemHref: `https://zhuanlan.zhihu.com/p/${target.id}`,
        itemHref2: `https://zhuanlan.zhihu.com/p/${target.id}`,
      };
    },
  },
  zvideo: {
    name: '视频',
    bTypeClass: 'c-12c2e9',
    contentItem: 'ZVideoItem',
    nType: 'ZVideo',
    formatData: (target: IZhihuRecommendDataTarget) => {
      return {
        itemTitle: target.title,
        itemHref: `https://www.zhihu.com/zvideo/${target.id}`,
        itemHref2: `https://www.zhihu.com/zvideo/${target.id}`,
      };
    },
  },
  pin: {
    name: '想法',
    bTypeClass: 'c-9c27b0',
    contentItem: 'PinItem',
    nType: 'Pin',
    formatData: (target: IZhihuRecommendDataTarget) => {
      return {
        itemTitle: target.title || '',
        itemHref: `https://www.zhihu.com/pin/${target.id}`,
        itemHref2: `https://www.zhihu.com/pin/${target.id}`,
      };
    },
  },
};

const createListHTML = (data: IZhihuRecommendData[], config: IConfig) => data.map((i) => createListItemHTML(i, config)).join('');

const createListItemHTML = (data: IZhihuRecommendData, config: IConfig) => {
  const { releaseTimeForList, copyAnswerLink, showToAnswer } = config;
  const { id, target, attachedInfo, brief } = data;
  const type = target.type as IItemType;
  const { contentItem, nType, formatData } = itemType[type];
  const { itemHref, itemHref2, itemTitle } = formatData(target);
  addHistoryItem(data);

  let extraHTML = '';
  copyAnswerLink && (extraHTML += createHTMLCopyLink(itemHref2));
  showToAnswer && type === 'answer' && (extraHTML += `<a href="${itemHref}" target="_blank" class="ctz-button ctz-button-transparent">直达问题</a>`);

  return `
<div class="Card TopstoryItem TopstoryItem-isRecommend ctz-recommend-item" tabindex="0">
  <div
    class="Feed"
    data-za-detail-view-path-module="FeedItem"
    data-za-detail-view-path-index="0"
    data-za-extra-module='{"card":{"card_type":"Feed","feed_id":"${id}","has_image":false,"has_video":false,"content":${brief}},"attached_info_bytes":"${attachedInfo}"}'
  >
    <div
      class="ContentItem ${contentItem}"
      data-zop='{"authorName":"${target.author.name}","itemId":${target.id},"title":"${itemTitle}","type":"${type}"}'
      name="${target.id}"
      itemprop="${type}"
      itemtype="http://schema.org/${nType}"
      itemscope=""
      data-za-detail-view-path-module="${contentItem}"
      data-za-detail-view-path-index="4"
      data-za-extra-module='{"card":{"has_image":false,"has_video":false,"content":{"type":"${nType}","token":"${target.id}","upvote_num":${
    target.voteupCount
  },"comment_num":${target.commentCount},"publish_timestamp":null,"author_member_hash_id":"${target.author.id}"}}}'
    >
      <h2 class="ContentItem-title">
        <div itemprop="zhihu:${type}" itemtype="http://schema.org/${nType}" itemscope="" style="display:inline;">
          <meta itemprop="url" itemprop="name" content="${itemHref}" />
          <meta content="${itemTitle}"/>
          <a target="_blank" data-za-detail-view-element_name="Title" data-za-detail-view-id="2812" href="${itemHref2}">${itemTitle}</a>
        </div>
      </h2>
      ${innerHTMLContentItemMeta(data, {
        extraHTML,
        haveTime: releaseTimeForList,
        config,
      })}
      ${innerHTMLRichInnerAndAction(data, { moreLength: 40, moreMaxHeight: '100px' })}
    </div>
  </div>
</div>`;
};

type IItemType = 'answer' | 'article' | 'zvideo' | 'pin';
