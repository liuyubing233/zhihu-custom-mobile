import { myStorage } from '../commons/storage';
import { createBtnTr, dom } from '../commons/tools';

/** 添加问题日志按钮 */
export const addQuestionLogButton = async () => {
  const { showQuestionLog } = await myStorage.getConfig();
  const nodeBtnGroup = dom('.MobileQuestionButtonGroup');
  const className = 'ctz-question-log';
  const prevBtn = dom(`.${className}`);
  if (!showQuestionLog || !nodeBtnGroup || prevBtn) return;
  const nBtn = createBtnTr('查看问题日志', className);
  nBtn.addEventListener('touchend', () => {
    const findPath = location.pathname.match(/\/question\/\d+/);
    if (findPath && findPath.length) {
      const nPathname = findPath[0];
      window.open(nPathname + '/log');
    }
  });
  nodeBtnGroup.appendChild(nBtn)
};
