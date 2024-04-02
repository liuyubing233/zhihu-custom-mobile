import { myStorage } from '../commons/storage';
import { dom, domC } from '../commons/tools';
import { CLASS_TIME_ITEM } from '../configs';
import { IMyElement } from '../types';

/** 时间格式化 */
export const timeFormatter = (time: string | number, formatter = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return '';
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  const preArr = (num: number) => (String(num).length !== 2 ? '0' + String(num) : String(num));
  return formatter
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, preArr(month))
    .replace(/DD/g, preArr(day))
    .replace(/HH/g, preArr(hour))
    .replace(/mm/g, preArr(min))
    .replace(/ss/g, preArr(sec));
};

/** 问题添加时间 */
export const updateItemTime = (event: IMyElement) => {
  const nodeCreated = event.querySelector('[itemprop="dateCreated"]') as HTMLMetaElement;
  const nodePublished = event.querySelector('[itemprop="datePublished"]') as HTMLMetaElement;
  const nodeModified = event.querySelector('[itemprop="dateModified"]') as HTMLMetaElement;
  const crTime = nodeCreated ? nodeCreated.content : '';
  const puTime = nodePublished ? nodePublished.content : '';
  const muTime = nodeModified ? nodeModified.content : '';
  const timeCreated = timeFormatter(crTime || puTime);
  const timeModified = timeFormatter(muTime);
  const nodeContentItemMeta = event.querySelector('.ContentItem-meta');
  if (!timeCreated || !nodeContentItemMeta) return;
  const innerHTML = `<div>创建于：${timeCreated}</div>${timeCreated !== timeModified ? `<div>编辑于：${timeModified}</div>` : ''}`;
  const domTime = event.querySelector(`.${CLASS_TIME_ITEM}`);
  if (domTime) {
    domTime.innerHTML = innerHTML;
  } else {
    nodeContentItemMeta.appendChild(
      domC('div', {
        className: CLASS_TIME_ITEM,
        innerHTML,
        style: 'line-height: 24px;padding-top: 2px;font-size: 14px;',
      })
    );
  }
};

/** 问题详情添加时间 */
export const addTimeForQuestion = async () => {
  const { releaseTimeForQuestion } = await myStorage.getConfig();
  const className = 'ctz-question-time';
  if (dom(`.${className}`)) return;
  const nodeCreated = dom('[itemprop="dateCreated"]');
  const nodeModified = dom('[itemprop="dateModified"]');
  const nodeTitle = dom('.QuestionHeader-title');
  if (!(releaseTimeForQuestion && nodeCreated && nodeModified && nodeTitle)) return;
  const createTime = timeFormatter(nodeCreated.content);
  const updateTime = timeFormatter(nodeModified.content);
  nodeTitle.appendChild(
    domC('div', {
      className,
      innerHTML: `<div>创建于：${createTime}</div>${updateTime !== createTime ? `<div>编辑于：${updateTime}</div>` : ''}`,
      style: 'font-size: 14px;',
    })
  );
};

/** 文章发布时间置顶 */
export const addTimeForArticle = async () => {
  const { releaseTimeForArticle } = await myStorage.getConfig();
  const className = 'ctz-article-create-time';
  if (dom(`.${className}`)) return;
  const nodeContentTime = dom('.ContentItem-time');
  const nodeHeader = dom('.Post-Header');
  if (!(releaseTimeForArticle && nodeContentTime && nodeHeader)) return;
  nodeHeader.appendChild(
    domC('span', {
      className,
      style: 'color: #8590a6;line-height: 30px;',
      innerHTML: nodeContentTime.innerText || '',
    })
  );
};

/**
 * 创建修改时间HTML
 * @param createTime
 * @param updateTime
 * @returns
 */
export const createTimeHTML = (createTime: string | number, updateTime: string | number) => {
  return (
    `<div class="${CLASS_TIME_ITEM}" style="line-height: 24px;padding-top: 2px;font-size: 14px;">` +
    `<div>创建于：${timeFormatter(+`${createTime}`)}</div>` +
    `${createTime !== updateTime && updateTime ? `<div>编辑于：${timeFormatter(+`${updateTime}`)}</div>` : ''}` +
    `</div>`
  );
};
