import { myStorage } from '../commons/storage';
import { dom } from '../commons/tools';

/** 回填历史记录 */
export const echoHistory = async () => {
  const history = await myStorage.getHistory();
  const { list, view } = history;
  const nodeList = dom('#CTZ_HISTORY_LIST .ctz-set-content');
  const nodeView = dom('#CTZ_HISTORY_VIEW .ctz-set-content');
  nodeList && (nodeList.innerHTML = list.join(''));
  nodeView && (nodeView.innerHTML = view.join(''));
};

/** 添加浏览历史 */
export const addHistoryView = async () => {
  const { href, origin, pathname, hash } = location;
  const question = 'www.zhihu.com/question/';
  const article = 'zhuanlan.zhihu.com/p/';
  const video = 'www.zhihu.com/zvideo/';
  let name = href.replace(hash, '');
  setTimeout(async () => {
    if (!href.includes(question) && !href.includes(article) && !href.includes(video)) return;
    href.includes(question) && dom('.QuestionHeader-title') && (name = `<b class="c-ec7259">「问题」</b>${dom('.QuestionHeader-title')!.innerText}`);
    href.includes(article) && dom('.Post-Title') && (name = `<b class="c-00965e">「文章」</b>${dom('.Post-Title')!.innerText}`);
    href.includes(video) && dom('.ZVideo-title') && (name = `<b class="c-12c2e9">「视频」</b>${dom('.ZVideo-title')!.innerText}`);
    const nA = `<a href="${origin + pathname}" target="_blank">${name}</a>`;
    const { view } = await myStorage.getHistory();
    if (!view.includes(nA)) {
      view.unshift(nA);
      await myStorage.setHistoryItem('view', view);
    }
  }, 500);
};
