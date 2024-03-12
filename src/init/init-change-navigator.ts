import { myStorage } from '../commons/storage';
import { NEED_CHANGE_NAVIGATOR_URL } from '../configs';

/** 修改 navigator.userAgent 以显示 PC 端回答和专栏内容，用于显示完整的回答和评论 */
export const initChangeNavigator = async () => {
  const { showAllContent } = await myStorage.getConfig();
  if (!showAllContent) return;

  const isNeedChange = (() => {
    const { href } = location;
    for (let i = 0, len = NEED_CHANGE_NAVIGATOR_URL.length; i < len; i++) {
      const item = NEED_CHANGE_NAVIGATOR_URL[i];
      if (href.includes(item)) {
        return true;
      }
    }
    return false;
  })();
  if (!isNeedChange) return;
  const customUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  // 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/84.0.4147.105 mobile Safari/537.36 SearchCraft baiduboxapp';

  // pc
  // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

  // mobile
  // 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'

  //修改后的userAgent
  Object.defineProperty(navigator, 'userAgent', {
    value: customUserAgent,
    writable: false,
  });
};
