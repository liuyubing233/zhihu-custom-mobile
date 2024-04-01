import { myStorage } from '../commons/storage';
import { HIDDEN_ANSWER_ACCOUNT, HIDDEN_ANSWER_TAG } from '../configs';

class Store {
  /** 页面高度 */
  pageHeight = 0;
  /** 回答屏蔽的标签 */
  hiddenTags: string[] = [];
  /** 回答屏蔽的用户 */
  hiddenUsers: string[] = [];

  constructor() {
    // to fix this is undefined
    this.setPageHeight = this.setPageHeight.bind(this);
    this.getPageHeight = this.getPageHeight.bind(this);
    this.initSetHidden = this.initSetHidden.bind(this);
    this.getHidden = this.getHidden.bind(this);
  }

  setPageHeight(height: number) {
    this.pageHeight = height;
  }
  getPageHeight() {
    return this.pageHeight;
  }
  async initSetHidden() {
    const config = await myStorage.getConfig();
    const nHiddenTags = Object.keys(HIDDEN_ANSWER_TAG)
      .filter((i) => !!config[i])
      .map((i) => HIDDEN_ANSWER_TAG[i]);
    this.hiddenTags = nHiddenTags;
    const nHiddenUsers = Object.keys(HIDDEN_ANSWER_ACCOUNT)
      .filter((i) => !!config[i])
      .map((i) => HIDDEN_ANSWER_ACCOUNT[i]);
    config.removeAnonymousAnswer && nHiddenUsers.push('匿名用户');
    this.hiddenUsers = nHiddenUsers;
  }
  getHidden() {
    return {
      hiddenTags: this.hiddenTags,
      hiddenUsers: this.hiddenUsers,
    };
  }
}

export const store = new Store();
