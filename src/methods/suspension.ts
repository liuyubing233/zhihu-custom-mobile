import { domC } from '../commons/tools';
import { IMyElement } from '../types';

/** 漂浮收起按钮的方法 */
export const fnSuspensionPickup = async (elements: NodeListOf<IMyElement>) => {
  for (let i = 0, len = elements.length; i < len; i++) {
    const even = elements[i];
    const evenSticky = even.querySelector('.ContentItem-actions') as HTMLElement;
    const evenButton = even.querySelector('.ContentItem-actions .ContentItem-rightButton') as HTMLButtonElement;
    const evenBtn = even.querySelector('.ctz-suspension-pickup');
    if (!evenButton) {
      evenBtn && evenBtn.remove();
      continue;
    }
    const isFixed = evenSticky.classList.contains('RichContent-actions');
    if (isFixed) {
      if (evenBtn) continue;
      const domButton = domC('div', {
        className: 'ctz-suspension-pickup',
        innerHTML: '收起 ^',
      });
      domButton.addEventListener('touchend', function (e) {
        e.preventDefault();
        evenButton.click();
        this.remove();
      });
      even.appendChild(domButton);
    } else if (evenBtn) {
      evenBtn.remove();
    }
  }
};
