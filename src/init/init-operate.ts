import { myDialog } from '../../src/methods/dialog-open-close';
import { dom, domA, domById } from '../commons/tools';
import { CLASS_INPUT_CHANGE, CLASS_INPUT_CLICK } from '../configs';
import { myButtonOperate } from '../methods/dialog-button-operate';
import { fnChanger } from '../methods/fn-changer';
import { myListenComment, myListenCommentChild } from '../methods/listen-comment';
import { myListenListRecommend } from '../methods/listen-list-recommend';
import { myMenu, myMenu2 } from '../methods/menu';
import { myPreview } from '../methods/preview';

/** 加载设置弹窗绑定方法 */
export const initOperate = () => {
  const myOperation: Record<string, Function> = {
    [CLASS_INPUT_CLICK]: fnChanger,
    [CLASS_INPUT_CHANGE]: fnChanger,
    'ctz-button': (even: HTMLButtonElement) => {
      myButtonOperate[even.name] && myButtonOperate[even.name](even);
    },
  };
  const operation = (even: Event) => {
    const target = even.target as HTMLElement;
    const classList = target.classList;
    for (let key in myOperation) {
      classList.contains(key) && myOperation[key](even.target);
    }
  };

  const nodeCTZContent = dom('.ctz-content');
  if (nodeCTZContent) {
    nodeCTZContent.onclick = operation;
    nodeCTZContent.onchange = operation;
  }

  dom('.ctz-menu')!.onclick = myMenu.click;
  domA('.ctz-content-top').forEach((i) => (i.onclick = myMenu2.click));
  domById('CTZ_OPEN_BUTTON')!.onclick = myDialog.open;
  domById('CTZ_CLOSE_DIALOG')!.onclick = myDialog.hide;
  // initTopStoryRecommendEvent();
  myListenListRecommend.initOperate()
  myListenComment.initOperate();
  myListenCommentChild.initOperate();
  domById('CTZ_PREVIEW_IMAGE')!.onclick = function () {
    myPreview.hide(this);
  };

  document.body.addEventListener('click', function (event: MouseEvent) {
    const { target } = event;
    if ((target as HTMLElement).classList.contains('css-hzocic')) {
      // 点击到了手动添加的关闭伪元素
      const nodeClose = dom('[aria-label="关闭"]');
      nodeClose && nodeClose.click();
    }
  });
};
