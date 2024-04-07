import { domC, domP } from '../commons/tools';
import { CLASS_COPY_LINK } from '../configs';
import { IMyElement, IZhihuDataZop } from '../types';
import { myListenComment } from './listen-comment';
import { myPreview } from './preview';
import { createTimeHTML } from './time';

/** 自定义展开按钮类名 */
export const CLASS_BTN_EXPEND = 'ctz-n-button-expend';
/** 自定义收起按钮类名 */
export const CLASS_BTN_CLOSE = 'ctz-n-button-close';
/** 自定义评论按钮类名 */
export const CLASS_BTN_COMMENT = 'ctz-n-button-comment';

/** 监听图片操作 */
export const addListenImage = (event: MouseEvent) => {
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

/** 自定义按钮的处理方式 */
export const eventListenButton = (event: MouseEvent) => {
  addListenImage(event);
  const target = event.target as IMyElement;
  Object.keys(eventMainObject).forEach((key) => {
    if (target.classList.contains(key)) {
      event.preventDefault();
      event.stopPropagation();
      eventMainObject[key](target);
    }
  });
};

const eventMainObject: Record<string, Function> = {
  /** 展开更多 */
  [CLASS_BTN_EXPEND]: (currentNode: HTMLElement) => {
    const nodeRich = domP(currentNode, 'class', 'RichContent')!;
    const nodeRichInner = nodeRich.querySelector('.RichContent-inner') as HTMLElement;
    const nodeBTNOther = nodeRich.querySelector(`.${CLASS_BTN_CLOSE}`) as HTMLElement;
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
    const nodeAnswerItem = domP(currentNode, 'class', 'ContentItem')!;
    const dataZopJson = nodeAnswerItem.getAttribute('data-zop') || '{}';
    const dataZop: IZhihuDataZop = JSON.parse(dataZopJson);
    myListenComment.create(dataZop.itemId);
  },
};

/**
 * 打开 LOADING
 * @param box 外层盒子
 * @param className LOADING元素类名
 */
export const openLoading = (box: HTMLElement, className: string) => {
  if (box.querySelector(`.${className}`)) return;
  box.appendChild(domC('div', { innerHTML: '<span>↻</span>', className }));
};

/**
 * 删除元素
 * @param box 外层盒子
 * @param className 元素类名
 */
export const removeByBox = (box: HTMLElement, className: string) => {
  const nodeFind = box.querySelector(`.${className}`);
  nodeFind && nodeFind.remove();
};

/**
 * 添加没有更多
 * @param box 外层盒子
 * @param className END元素类名
 */
export const openEnd = (box: HTMLElement, className: string) => {
  if (box.querySelector(`.${className}`)) return;
  box.appendChild(domC('div', { innerText: '----- 没有更多了 -----', className }));
};

/** innerHTML for 用户信息栏及下面扩展 */
export const innerHTMLContentItemMeta = (data: any, options?: { extraHTML?: string; haveTime?: boolean }) => {
  const { target, createdTime, updatedTime } = data;
  const { extraHTML = '', haveTime } = options || {};
  return `
<div class="ContentItem-meta">
  <div class="AuthorInfo AnswerItem-authorInfo AnswerItem-authorInfo--related" itemprop="author" itemscope="" itemtype="http://schema.org/Person">
    <div class="AuthorInfo AuthorInfo--mobile">
      <meta itemprop="name" content="${target.author.name}" />
      <meta itemprop="image" content="${target.author.avatarUrl}" />
      <meta itemprop="url" content="https://www.zhihu.com/people/${target.author.urlToken}" />
      <meta itemprop="zhihu:followerCount" />
      <span class="UserLink AuthorInfo-avatarWrapper">
        <a href="//www.zhihu.com/people/${target.author.urlToken}" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">
          <img class="Avatar AuthorInfo-avatar" src="${target.author.avatarUrl}" srcset="${target.author.avatarUrl} 2x" alt="${target.author.name}" />
        </a>
      </span>
      <div class="AuthorInfo-content">
        <div class="AuthorInfo-head">
          <span class="UserLink AuthorInfo-name">
            <a href="//www.zhihu.com/people/${target.author.urlToken}" target="_blank" class="UserLink-link" data-za-detail-view-element_name="User">${
    target.author.name
  }</a>
          </span>
        </div>
        <div class="AuthorInfo-detail">
          <div class="AuthorInfo-badge"><div class="ztext AuthorInfo-badgeText">${target.author.headline}</div></div>
        </div>
      </div>
      ${extraHTML}
    </div>
  </div>
  ${haveTime ? createTimeHTML(`${createdTime}000`, `${updatedTime}000`) : ''}
  <div class="LabelContainer-wrapper"></div>
</div>
`;
};

/** innerHTML for 内容和操作栏 */
export const innerHTMLRichInnerAndAction = (data: any, options?: { moreLength?: number; moreMaxHeight?: string }) => {
  const { moreLength = 400, moreMaxHeight = '180px' } = options || {};
  const { target, createdTime, updatedTime } = data;
  const isVideo = target.type === 'zvideo';
  const isPin = target.type === 'pin';
  const innerHTML = isVideo
    ? `
<a
  class="video-box"
  href="https://link.zhihu.com/?target=https%3A//www.zhihu.com/video/${target.thumbnailExtraInfo.videoId}"
  target="_blank"
  data-video-id=""
  data-video-playable=""
  data-name=""
  data-poster="${target.thumbnailExtraInfo.url}"
  data-lens-id="${target.thumbnailExtraInfo.videoId}"
>
  <img class="thumbnail" src="" />
  <span class="content">
    <span class="title">
      <span class="z-ico-extern-gray"></span>
      <span class="z-ico-extern-blue"></span>
    </span>
    <span class="url">
      <span class="z-ico-video"></span>
      https://www.zhihu.com/video/${target.thumbnailExtraInfo.videoId}
    </span>
  </span>
</a>
    `
    : isPin
    ? target.contentHtml || target.content
    : target.content;

  const isMore = isVideo ? true : innerHTML.length > moreLength;
  const vDomContent = domC('div', { innerHTML });
  vDomContent.querySelectorAll('img').forEach((item) => {
    item.src = item.getAttribute('data-original') || item.getAttribute('data-actualsrc') || '';
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

  const voteCount = target.voteupCount || target.voteCount;
  return `
<meta itemprop="image" />
<meta itemprop="upvoteCount" content="${voteCount}" />
<meta itemprop="dateCreated" content="${createdTime}000" />
<meta itemprop="dateModified" content="${updatedTime}000" />
<meta itemprop="commentCount" content="${target.commentCount}" />
<div class="RichContent ${isMore ? 'is-collapsed' : ''} RichContent--unescapable">
  <div class="RichContent-inner RichContent-inner--collapsed" style="${isMore ? `max-height: ${moreMaxHeight}` : ''}">${contentHTML}</div>
  <div class="ContentItem-actions">
    <button aria-label="赞同 ${voteCount}" aria-live="polite" type="button" class="Button VoteButton VoteButton--up">
      ▲ 赞同 ${voteCount}
    </button>
    <button   aria-label="反对" aria-live="polite" type="button" class="Button VoteButton VoteButton--down VoteButton--mobileDown">
      ▼
    </button>
    <button class="ctz-n-button-comment Button Button--plain Button--withIcon Button--withLabel">评论 ${target.commentCount}</button>
    ${isMore ? '<button class="ctz-n-button-close Button" style="display: none">收起 ▲</button>' : ''}
  </div>
  ${isMore ? '<button class="ctz-n-button-expend">展开更多 ▼</button>' : ''}
</div>
`;
};

export const createHTMLCopyLink = (link: string) =>
  `<button class="ctz-button ctz-button-transparent ${CLASS_COPY_LINK}" data-link="${link}" style="margin: 0px 8px">获取链接</button>`;
