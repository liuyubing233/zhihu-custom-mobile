import { dom, domA } from '../commons/tools';
import { HEADER } from '../configs';

/** 设置菜单方法 */
export const myMenu = {
  init: function () {
    // 匹配顶部菜单项或者匹配菜单子项
    const { hash } = location;
    const nodeMenuTop = dom('.ctz-menu');
    if (!nodeMenuTop) return;
    const chooseId = [...nodeMenuTop.children].map((i: any) => i.hash).find((i) => i === hash || hash.replace(i, '') !== hash);
    this.click({ target: dom(`a[href="${chooseId || HEADER[0].href}"]`) });
  },
  /** 选择菜单 */
  click: function ({ target }: any) {
    const targetForA = target.tagName === 'A' ? target : target.parentElement;
    if (!(targetForA.hash && targetForA.tagName === 'A')) return;
    const chooseId = targetForA.hash.replace(/#/, '');
    if (!chooseId) return;
    const nodesA = domA('.ctz-menu>a');
    for (let i = 0, len = nodesA.length; i < len; i++) {
      nodesA[i].classList.remove('target');
    }
    targetForA.classList.add('target');
    const nodesDiv = domA('.ctz-content>div');
    for (let i = 0, len = nodesDiv.length; i < len; i++) {
      const item = nodesDiv[i];
      item.style.display = chooseId === item.id ? 'flex' : 'none';
    }
    myMenu2.init(chooseId);
  },
};

/** 设置二级菜单 */
export const myMenu2 = {
  init: function (chooseId: string) {
    const domContentTop = dom(`#${chooseId} .ctz-content-top`);
    if (!domContentTop || !domContentTop.children || !domContentTop.children.length) return;
    const { hash } = location;
    const target = [...domContentTop.children].find((i: any) => i.hash === hash);
    this.click({ target: target || domContentTop.children[0] });
  },
  click: function ({ target }: any) {
    const chooseId = target.hash.replace(/#/, '');
    if (!chooseId) return;
    const nodesA = target.parentElement.children;
    for (let i = 0, len = nodesA.length; i < len; i++) {
      nodesA[i].classList.remove('target');
    }
    target.classList.add('target');
    const nodesDiv = target.parentElement.parentElement.querySelectorAll('.ctz-content-center>div');
    for (let i = 0, len = nodesDiv.length; i < len; i++) {
      const item = nodesDiv[i];
      item.style.display = chooseId === item.id ? 'block' : 'none';
    }
  },
};
