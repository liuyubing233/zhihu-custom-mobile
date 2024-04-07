import { myScroll } from '../commons/scroll-stop-on';
import { domById } from '../commons/tools';
import { echoData } from './echo-data';
import { echoHistory } from './history';

/** 编辑器弹窗打开关闭方法 */
export const myDialog = {
  open: (e?: TouchEvent) => {
    e && e.preventDefault();
    const nodeDialog = domById('CTZ_DIALOG');
    nodeDialog && (nodeDialog.style.display = 'flex');
    myScroll.stop();
    echoData();
    echoHistory();
  },
  hide: () => {
    const nodeDialog = domById('CTZ_DIALOG');
    nodeDialog && (nodeDialog.style.display = 'none');
    myScroll.on();
  },
};
