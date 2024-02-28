import { myStorage } from '../commons/storage';
import { dom, domP } from '../commons/tools';
import { addAnswerCopyLink } from '../methods/link';
import { updateItemTime } from '../methods/time';

/** 推荐列表最外层绑定事件 */
export const initTopStoryRecommendEvent = () => {
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
};
