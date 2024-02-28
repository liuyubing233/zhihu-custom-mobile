
class Store {
  /** 页面高度 */
  pageHeight = 0;

  constructor() {
    // to fix this is undefined
    this.setPageHeight = this.setPageHeight.bind(this)
    this.getPageHeight = this.getPageHeight.bind(this)
  }

  setPageHeight(height: number) {
    this.pageHeight = height;
  }
  getPageHeight() {
    return this.pageHeight;
  }
}

export const store = new Store();
