import { dom, throttle, windowResize } from '../commons/tools';
import { HTML_HOOTS } from '../configs';
import { myListenListItem } from '../methods/listen-list-item';
import { myListenListRecommend } from '../methods/listen-list-recommend';
import { store } from '../store';

/** 使用 ResizeObserver 监听body高度 */
export const initResizeObserver = () => {
  const resizeObserver = new ResizeObserver(throttle(resizeFun, 500));
  resizeObserver.observe(document.body);
};

function resizeFun() {
  if (!HTML_HOOTS.includes(location.hostname)) return;
  const { getPageHeight, setPageHeight } = store;
  // 比较列表缓存的高度是否大于当前高度，如果大于则是从 index = 0 遍历
  const nodeTopStoryC = dom('.TopstoryMain') || dom('.NotLoggedInTopstory');
  if (nodeTopStoryC) {
    const heightForList = getPageHeight();
    const heightTopStoryContent = nodeTopStoryC.offsetHeight;
    if (heightTopStoryContent < heightForList) {
      myListenListItem.restart();
      // initTopStoryRecommendEvent();
      myListenListRecommend.initOperate()
    } else {
      myListenListItem.init();
    }
    // 如果列表模块高度小于网页高度则手动触发 resize 使其加载数据
    heightTopStoryContent < window.innerHeight && windowResize();
    setPageHeight(heightTopStoryContent);
  }
}
