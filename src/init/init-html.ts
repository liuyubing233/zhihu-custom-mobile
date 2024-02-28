import { dom, domC } from '../commons/tools';
import { HEADER, HIDDEN_ARRAY } from '../configs';
import { BASIC_SHOW_CONTENT } from '../configs/basic-show';
import { addBackgroundElement } from '../methods/background';
import { myMenu } from '../methods/menu';
import { openButtonPosition } from '../methods/open-button-position';
import { INNER_HTML, INNER_VERSION } from '../web-resources';

/** 加载基础元素及绑定方法 */
export const initHTML = () => {
  document.body.appendChild(domC('div', { id: 'CTZ_MAIN', innerHTML: INNER_HTML }));
  openButtonPosition();
  dom('.ctz-version')!.innerText = `version: ${INNER_VERSION}`;
  dom('.ctz-menu')!.innerHTML = HEADER.map(({ href, value }) => `<a href="${href}"><span>${value}</span></a>`).join('');

  addBackgroundElement();

  // 隐藏元素部分
  dom('#CTZ_HIDDEN .ctz-content-center')!.innerHTML = HIDDEN_ARRAY.map(
    (itemArr) =>
      itemArr.map(({ label, value }) => `<label class="dis-if-c"><input class="ctz-i" name="${value}" type="checkbox" value="on" />${label}</label>`).join('') +
      '<div class="ctz-hidden-item-br"></div>'
  ).join('');

  // 添加基础设置显示修改
  dom('#CTZ_BASIS_SHOW')!.innerHTML += BASIC_SHOW_CONTENT.map(
    ({ label, value, needFetch }) =>
      `<label class="ctz-flex-wrap ${needFetch ? 'ctz-fetch-intercept' : ''}">` +
      `<span class="ctz-label">${label}${needFetch ? '<span class="ctz-need-fetch">（接口拦截已关闭，此功能无法使用）</span>' : ''}</span>` +
      `<input class="ctz-i" name="${value}" type="checkbox" value="on" />` +
      `</label>`
  ).join('');

  myMenu.init();
};
