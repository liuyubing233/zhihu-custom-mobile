import { dom, fnInitDomStyle, fnLog, throttle } from './commons/tools';
import { EXTRA_CLASS_HTML, HTML_HOOTS } from './configs/dom-name';
import { initHTML } from './init/init-html';
import { initOperate } from './init/init-operate';
import { onInitStyleExtra } from './init/init-style-extra';
import { loadBackground, myCustomStyle } from './methods/background';
import { myDialog } from './methods/dialog-open-close';
import { echoData } from './methods/echo-data';
import { addHistoryView, echoHistory } from './methods/history';
import { myListenAnswer } from './methods/listen-answer';
import { fnListenArticle } from './methods/listen-article';
import { myListenListRecommend } from './methods/listen-list-recommend';
import { addQuestionLogButton } from './methods/question-log';
import { addTimeForArticle, addTimeForQuestion } from './methods/time';
import { store } from './store';
import { INNER_CSS } from './web-resources';

(function () {
  const { hostname, host, pathname } = location;
  if (!HTML_HOOTS.includes(hostname) || window.frameElement) return;
  GM_registerMenuCommand('⚙️ 设置', () => {
    myDialog.open();
  });
  store.initSetHidden();

  /** 在启动时注入的内容 */
  async function onDocumentStart() {
    if (!document.head || !document.body) {
      fnLog('not find head and body, waiting for reload...');
      setTimeout(() => {
        fnLog('to reload...')
        onDocumentStart()
      }, 500)
      return;
    }
    fnInitDomStyle('CTZ_STYLE', INNER_CSS);
    addHistoryView();
    onInitStyleExtra();
    EXTRA_CLASS_HTML[host] && dom('html')!.classList.add(EXTRA_CLASS_HTML[host]);

    initHTML();
    initOperate();
    echoData();
    // 页面加载完成后再进行加载背景色, 解决存在顶部推广的 header 颜色
    loadBackground();
    myCustomStyle.init();
    echoHistory();

    setTimeout(() => {
      myListenListRecommend.init();
    }, 0);

    if (host === 'zhuanlan.zhihu.com') {
      addTimeForArticle();
      fnListenArticle();
    }

    if (/question/.test(pathname)) {
      addTimeForQuestion();
      addQuestionLogButton();
      setTimeout(() => {
        myListenAnswer.init();
      }, 0);
    }
    fnLog('function onDocumentStart init')
  }
  onDocumentStart();

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
      myListenAnswer.scroll();
      myListenListRecommend.scroll();
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
