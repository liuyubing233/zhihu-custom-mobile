import { myListenAnswer } from "../methods/listen-answer";

/** 加载问答详情修改 */
export const initChangeAnswer = () => {
  // TODO
  if (!location.href.includes('www.zhihu.com/question')) return;
  // www.zhihu.com/question/
  console.log('is in answer')
  setTimeout(() => {
    myListenAnswer.init();
  }, 0)
}


