import { myStorage } from './commons/storage';
import { dom, domA, fnInitDomStyle, fnLog, pathnameHasFn, throttle } from './commons/tools';
import { EXTRA_CLASS_HTML, HTML_HOOTS } from './configs/dom-name';
import { initHTML } from './init/init-html';
import { initResizeObserver } from './init/init-observer-resize';
import { initOperate } from './init/init-operate';
import { onInitStyleExtra } from './init/init-style-extra';
import { loadBackground, myCustomStyle } from './methods/background';
import { myDialog } from './methods/dialog-open-close';
import { echoData } from './methods/echo-data';
import { addHistoryView, echoHistory } from './methods/history';
import { myListenAnswer } from './methods/listen-answer';
import { fnListenArticle } from './methods/listen-article';
import { myListenListItem } from './methods/listen-list-item';
import { addQuestionLogButton } from './methods/question-log';
import { fnSuspensionPickup } from './methods/suspension';
import { addTimeForArticle, addTimeForQuestion } from './methods/time';
import { store } from './store';
import { INNER_CSS } from './web-resources';

(function () {
  const { hostname, host } = location;
  /** 挂载脚本时 document.head 是否渲染 */
  let isHaveHeadWhenInit = true;
  GM_registerMenuCommand('⚙️ 设置', () => {
    myDialog.open();
  });
  store.initSetHidden();

  /** 在启动时注入的内容 */
  async function onDocumentStart() {
    if (!HTML_HOOTS.includes(hostname) || window.frameElement) return;
    if (!document.head) {
      fnLog('not find document.head, waiting for reload...');
      isHaveHeadWhenInit = false;
      return;
    }
    fnInitDomStyle('CTZ_STYLE', INNER_CSS);
    addHistoryView();
    onInitStyleExtra();
    EXTRA_CLASS_HTML[host] && dom('html')!.classList.add(EXTRA_CLASS_HTML[host]);
  }
  onDocumentStart();

  /** 页面加载完成（不包含资源） */
  window.addEventListener(
    'DOMContentLoaded',
    async () => {
      // 如果脚本注入时 document.head 未加载完成则在页面渲染后重新进行加载
      if (!isHaveHeadWhenInit) {
        await onDocumentStart();
      }
      if (HTML_HOOTS.includes(hostname) && !window.frameElement) {
        initHTML();
        initOperate();
        echoData();
        // 页面加载完成后再进行加载背景色, 解决存在顶部推广的 header 颜色
        loadBackground();
        myCustomStyle.init();
        initResizeObserver();
        echoHistory();
      }

      historyToChangePathname();
      if (host === 'zhuanlan.zhihu.com') {
        addTimeForArticle();
        fnListenArticle();
      }
    },
    false
  );

  const historyToChangePathname = () => {
    pathnameHasFn({
      question: () => {
        addTimeForQuestion();
        addQuestionLogButton();
        setTimeout(() => {
          myListenAnswer.init();
        }, 0);
      },
    });
  };

  /** 页面路由变化, 部分操作方法 */
  const changeHistory = () => {
    historyToChangePathname();
    // 重置监听起点
    myListenListItem.reset();
  };
  /** history 变化 */
  window.addEventListener('popstate', changeHistory);
  window.addEventListener('pushState', changeHistory);

  /** 页面资源加载完成 */
  window.addEventListener('load', () => {
    // 如果存在登录弹窗则移除
    const nodeSignModal = dom('.signFlowModal');
    const nodeSignClose = nodeSignModal && (nodeSignModal.querySelector('.Modal-closeButton') as HTMLButtonElement);
    nodeSignClose && nodeSignClose.click();
  });

  // 复制代码块删除版权信息
  document.addEventListener('copy', function (event) {
    // @ts-ignore window.clipboardData 是存在于IE中
    let clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    const selection = window.getSelection();
    let text = selection ? selection.toString() : '';
    if (text) {
      event.preventDefault();
      clipboardData.setData('text/plain', text);
    }
  });

  /** 页面滚动方法 */
  window.addEventListener(
    'scroll',
    throttle(async () => {
      const { suspensionPickup } = await myStorage.getConfig();
      if (suspensionPickup) {
        fnSuspensionPickup(domA('.List-item'));
        fnSuspensionPickup(domA('.TopstoryItem'));
        fnSuspensionPickup(domA('.AnswerCard'));
      }
      myListenAnswer.scroll();
    }, 100),
    false
  );

  // 复制代码块删除版权信息
  document.addEventListener('copy', function (event) {
    // @ts-ignore window.clipboardData 是存在于IE中
    let clipboardData = event.clipboardData || window.clipboardData;
    if (!clipboardData) return;
    const selection = window.getSelection();
    let text = selection ? selection.toString() : '';
    if (text) {
      event.preventDefault();
      clipboardData.setData('text/plain', text);
    }
  });
})();
