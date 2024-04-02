import { nodesStopPropagation } from '../commons/tools';
import { myListenComment } from './listen-comment';

export const fnListenArticle = () => {
  nodesStopPropagation(['.RichContent-actions .VoteButton', '.BottomActions-CommentBtn'], [clickCommit]);
};

const clickCommit = (event: Event) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains('BottomActions-CommentBtn')) {
    const id = location.pathname.replace('/p/', '');
    myListenComment.create(id, undefined, undefined, 'articles');
  }
};
