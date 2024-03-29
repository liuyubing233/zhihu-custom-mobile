import { requestComment } from '../commons/request';
import { dom, domA, domC, domP } from '../commons/tools';
import { IZhihuDataZop } from '../types';
import { myLoadingToast } from '../types/loading-toast';
import { myListenComment } from './listen-comment';

/** 自定义展开按钮类名 */
const CLASS_BTN_EXPEND = 'ctz-n-button-expend';
/** 自定义收起按钮类名 */
const CLASS_BTN_CLOSE = 'ctz-n-button-close';
/** 自定义评论按钮类名 */
const CLASS_BTN_COMMENT = 'ctz-n-button-comment';

/**
 * 新的回答内容监听，用于处理移动端网页
 * 旧文件后续删除（./listen-answer-item.ts）
 */
export const myListenAnswer = {
  // index: 0,
  init: async function () {
    dom('.Question-main')!.addEventListener('click', eventListenerQuestionMain);
    nodesStopPropagation(['.RichContent-inner', '.Question-main figure img', '.Question-main a']);
    const nodeAnswers = domA('.ContentItem.AnswerItem');
    console.log('nodeAnswers', nodeAnswers);
    for (let i = 0, len = nodeAnswers.length; i < len; i++) {
      const nodeItem = nodeAnswers[i];
      const nodeRich = nodeItem.querySelector('.RichContent') as HTMLElement;
      // const nodeRichInner = nodeItem.querySelector('.RichContent-inner') as HTMLElement;
      const nodeActions = nodeItem.querySelector('.ContentItem-actions') as HTMLElement;
      setTimeout(() => {
        // 添加评论按钮
        const count = (nodeItem.querySelector('[itemprop="commentCount"]') as HTMLMetaElement).content;
        const nCommentBtn = cDomCommentBtn(count);
        nodeActions.appendChild(nCommentBtn);

        // 添加自定义的展开、收起按钮
        if (nodeRich.classList.contains('is-collapsed')) {
          const nExpendButton = domC('button', {
            innerHTML: '展开更多 ▼',
            className: CLASS_BTN_EXPEND,
          });
          const nCloseButton = domC('button', {
            innerHTML: '收起 ▲',
            className: `${CLASS_BTN_CLOSE} Button`,
            style: 'display: none;',
          });
          nodeRich.appendChild(nExpendButton);
          nodeActions.appendChild(nCloseButton);
        }
      }, 1000);
    }
  },
  /** 滚动时回答内容处理 */
  scroll: async function () {
    const nodeAnswers = domA('.ContentItem.AnswerItem');
    const windowHeight = window.innerHeight;
    for (let i = 0, len = nodeAnswers.length; i < len; i++) {
      // 悬浮底部操作栏
      const nodeItem = nodeAnswers[i];
      const nodeClose = nodeItem.querySelector(`.${CLASS_BTN_CLOSE}`) as HTMLElement | null;
      if (!nodeClose || nodeClose.style.display === 'none') continue;
      const bounding = nodeItem.getBoundingClientRect();
      const nodeActions = nodeItem.querySelector('.ContentItem-actions') as HTMLElement;
      if (bounding.bottom < windowHeight || bounding.top > windowHeight) {
        if (nodeActions.style.cssText) {
          nodeActions.style.cssText = '';
        }
        continue;
      }
      nodeActions.style.cssText += `position: fixed; bottom: 0; left: 0; width: 100%!important; margin: 0;box-shadow: 0 -1px 3px rgba(25,27,31,0.1);`;
    }
  },
};

/** 批量阻止事件传递 */
const nodesStopPropagation = (classNames: string[]) => {
  let nodeArray: HTMLElement[] = [];
  classNames.forEach((item) => {
    nodeArray = nodeArray.concat(Array.prototype.slice.call(domA(item)));
  });
  for (let i = 0, len = nodeArray.length; i < len; i++) {
    nodeArray[i].addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }
};

const eventQuestionMain: Record<string, Function> = {
  [CLASS_BTN_EXPEND]: (currentNode: HTMLElement) => {
    const nodeRich = domP(currentNode, 'class', 'RichContent')!;
    const nodeRichInner = nodeRich.querySelector('.RichContent-inner') as HTMLElement;
    const nodeBTNOther = nodeRich.querySelector(`.${CLASS_BTN_CLOSE}`) as HTMLElement;
    nodeRich.classList.remove('is-collapsed');
    nodeRichInner.style.maxHeight = 'max-content';
    nodeBTNOther.style.display = 'block';
    currentNode.style.display = 'none';
  },
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
  [CLASS_BTN_COMMENT]: async (currentNode: HTMLElement) => {
    myLoadingToast.open()
    const nodeAnswerItem = domP(currentNode, 'class', 'AnswerItem')!;
    const dataZopJson = nodeAnswerItem.getAttribute('data-zop') || '{}';
    const dataZop: IZhihuDataZop = JSON.parse(dataZopJson);
    const res = await requestComment({ answerId: dataZop.itemId });
    res && myListenComment.create(res);
    myLoadingToast.hide()
  },
};

/** 监听问答详情最顶层 */
const eventListenerQuestionMain = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  Object.keys(eventQuestionMain).forEach((key) => {
    if (target.classList.contains(key)) {
      event.preventDefault();
      event.stopPropagation();
      eventQuestionMain[key](target);
    }
  });
};

/** 创建元素：评论按钮 */
const cDomCommentBtn = (count: string | number = 0) => {
  return domC('button', {
    className: `${CLASS_BTN_COMMENT} Button Button--plain Button--withIcon Button--withLabel`,
    innerHTML: `评论 ${count}`,
  });
};
