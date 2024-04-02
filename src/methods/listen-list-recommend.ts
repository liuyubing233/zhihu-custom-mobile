import { commonRequest } from '../commons/request';
import { myStorage } from '../commons/storage';
import { dom, domById, domC, domP, fnLog } from '../commons/tools';
import { IConfig } from '../types';
import { IZhihuListRecommendResponse, IZhihuRecommendData } from '../types/zhihu-list-response.type';
import { addAnswerCopyLink } from './link';
import { createTimeHTML, updateItemTime } from './time';

/** 加载推荐列表 */
export const myListenListRecommend = {
  next: '',
  loading: false,
  init: function () {
    const nodeJsonData = domById('js-initialData');
    if (!nodeJsonData) {
      fnLog('cannot find script #js-initialData');
      return;
    }
    const pageJsData = JSON.parse(nodeJsonData.innerText || '{}');
    const next = pageJsData.initialState.topstory.recommend.next;
    console.log('next', next);
    this.next = next;
  },
  formatInitListItems: function () {
    //
  },
  initOperate: function () {
    const nodeTopStoryRecommend = dom('.TopstoryMain') || dom('.NotLoggedInTopstory');
    if (!nodeTopStoryRecommend) return;
    const classTarget = ['RichContent-cover', 'RichContent-inner', 'ContentItem-more', 'ContentItem-arrowIcon'];
    const canFindTargeted = (e: HTMLElement) => {
      let isFind = false;
      classTarget.forEach((item) => {
        const parentTarget = domP(e, 'class', item);
        (e.classList.contains(item) || (parentTarget && parentTarget.classList.contains(item))) && (isFind = true);
      });
      return isFind;
    };

    nodeTopStoryRecommend.addEventListener('click', async function (event) {
      const target = event.target as HTMLElement;
      const nodeContentItem = domP(target, 'class', 'ContentItem');
      if (!nodeContentItem) return;
      const { releaseTimeForList } = await myStorage.getConfig();
      // 列表内容展示更多
      if (canFindTargeted(target)) {
        setTimeout(() => {
          releaseTimeForList && updateItemTime(nodeContentItem);
          addAnswerCopyLink(nodeContentItem);
        }, 100);
      }
    });
  },
  scroll: function () {
    const nodeTopstoryMain = dom('.TopstoryMain');
    if (!nodeTopstoryMain) return;
    const bounding = nodeTopstoryMain.getBoundingClientRect();
    if (bounding.bottom - 200 <= window.innerHeight && !this.loading) {
      const nodeListContent = nodeTopstoryMain.querySelector('[role="list"]') as HTMLElement;
      this.requestData(nodeListContent);
      console.log('????');
    }
  },
  requestData: async function (nodeListContent: HTMLElement) {
    this.loading = true;
    openLoading(nodeListContent);
    const res = await commonRequest(this.next);
    if (!res) return;
    console.log('res', res.data);
    const { paging, data } = res as IZhihuListRecommendResponse;
    if (paging.next === this.next) return;
    this.next = paging.next;
    const config = await myStorage.getConfig();
    nodeListContent.innerHTML += createListHTML(data, config);
    hideLoading(nodeListContent);
    this.loading = false;
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

const openLoading = (box: HTMLElement) => {
  if (box.querySelector('.ctz-list-loading')) return;
  const nNode = domC('div', {
    innerHTML: '<span>↻</span>',
    className: 'ctz-list-loading',
  });
  box.appendChild(nNode);
};

const hideLoading = (box: HTMLElement) => {
  const nodeFind = box.querySelector('.ctz-list-loading');
  nodeFind && nodeFind.remove();
};

const createListHTML = (data: IZhihuRecommendData[], config: IConfig) => data.map((i) => createListItemHTML(i, config)).join('');

const createListItemHTML = (data: IZhihuRecommendData, config: IConfig) => {
  const { releaseTimeForList } = config;
  const { id, target, attached_info, brief } = data;
  const type = target.type;
  return `
<div class="Card TopstoryItem TopstoryItem-isRecommend ctz-recommend-item" tabindex="0">
  <div
    class="Feed"
    data-za-detail-view-path-module="FeedItem"
    data-za-detail-view-path-index="0"
    data-za-extra-module='{"card":{"card_type":"Feed","feed_id":"${id}","has_image":false,"has_video":false,"content":${brief}},"attached_info_bytes":"${attached_info}"}'
  >
    <div
      class="ContentItem AnswerItem"
      data-zop='{"authorName":"${target.author.name}","itemId":${target.id},"title":"${target.question.title}","type":"${type}"}'
      name="${target.id}"
      itemprop="${type}"
      itemtype="http://schema.org/Answer"
      itemscope=""
      data-za-detail-view-path-module="AnswerItem"
      data-za-detail-view-path-index="4"
      data-za-extra-module='{"card":{"has_image":false,"has_video":false,"content":{"type":"Answer","token":"${target.id}","upvote_num":${
    target.voteup_count
  },"comment_num":${target.comment_count},"publish_timestamp":null,"parent_token":"${target.question.id}","author_member_hash_id":"${target.author.id}"}}}'
    >
      <h2 class="ContentItem-title">
        <div itemprop="zhihu:question" itemtype="http://schema.org/Question" itemscope="">
          <meta
            itemprop="url"
            itemprop="name"
            content="https://www.zhihu.com/question/${target.question.id}" /><meta
            content="${target.question.title}"
          />
            <a target="_blank" data-za-detail-view-element_name="Title" data-za-detail-view-id="2812" href="//www.zhihu.com/question/${
              target.question.id
            }/answer/${target.id}">${target.question.title}</a>
        </div>
      </h2>
      <div class="ContentItem-meta">
        <div class="AuthorInfo AnswerItem-authorInfo AuthorInfo--plain" itemprop="author" itemscope="" itemtype="http://schema.org/Person">
          <div class="AuthorInfo AuthorInfo--mobile">
            <meta itemprop="name" content="${target.author.name}" />
            <meta itemprop="image" content="${target.author.avatar_url}" />
            <meta itemprop="url" content="https://www.zhihu.com/people/${target.author.url_token}" />
            <meta itemprop="zhihu:followerCount" />
            <span class="UserLink AuthorInfo-avatarWrapper">
              <a href="//www.zhihu.com/people/sigon-55" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">
                <img class="Avatar AuthorInfo-avatar" src="${target.author.avatar_url}" srcset="${target.author.avatar_url} 2x" alt="${target.author.name}" />
              </a>
            </span>
            <div class="AuthorInfo-content">
              <div class="AuthorInfo-head">
                <span class="UserLink AuthorInfo-name">
                  <a href="//www.zhihu.com/people/${target.author.url_token}" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">${
    target.author.name
  }</a>
                </span>
              </div>
              <div class="AuthorInfo-detail">
                <div class="AuthorInfo-badge"><div class="ztext AuthorInfo-badgeText">${target.author.headline}</div></div>
              </div>
            </div>
            <button class="ctz-button ctz-button-transparent ctz-copy-answer-link" style="margin: 0px 8px">获取链接</button>
          </div>
        </div>
        ${releaseTimeForList ? createTimeHTML(`${target.created_time}000`, `${target.updated_time}000`) : ''}
        <div class="LabelContainer-wrapper"></div>
      </div>
      <meta itemprop="image" />
      <meta itemprop="upvoteCount" content="${target.voteup_count}" />
      <meta itemprop="url" content="https://www.zhihu.com/question/${target.question.id}/answer/${target.id}" />
      <meta itemprop="dateCreated" content="${target.created_time}000" />
      <meta itemprop="dateModified" content="${target.updated_time}000" />
      <meta itemprop="commentCount" content="${target.comment_count}" />
      <div class="RichContent">
        <div class="RichContent-inner">${target.content}</div>
      </div>
    </div>
  </div>
</div>`;
};
