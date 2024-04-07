import { myDialog } from '../../src/methods/dialog-open-close';
import { copy, dom, domA, domById, message } from '../commons/tools';
import { CLASS_COPY_LINK, CLASS_INPUT_CHANGE, CLASS_INPUT_CLICK } from '../configs';
import { myButtonOperate } from '../methods/dialog-button-operate';
import { fnChanger } from '../methods/fn-changer';
import { myListenComment, myListenCommentChild } from '../methods/listen-comment';
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
    nodeCTZContent.addEventListener('touchend', operation);
    nodeCTZContent.onchange = operation;
  }

  dom('.ctz-menu')!.onclick = myMenu.click;
  domA('.ctz-content-top').forEach((i) => {
    i.addEventListener('touchend', myMenu2.click);
  });

  domById('CTZ_OPEN_BUTTON')!.addEventListener('touchend', myDialog.open);
  domById('CTZ_CLOSE_DIALOG')!.addEventListener('touchend', myDialog.hide);

  myListenComment.initOperate();
  myListenCommentChild.initOperate();

  domById('CTZ_PREVIEW_IMAGE')!.addEventListener('touchend', function () {
    myPreview.hide(this);
  });

  document.body.addEventListener('touchend', function (event: TouchEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains(CLASS_COPY_LINK)) {
      const link = target.getAttribute('data-link')!;
      copy(link);
      message('链接复制成功');
    }
  });
};
