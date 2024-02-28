import { myStorage } from '../commons/storage';
import { domById } from '../commons/tools';

const positionOne = (position: number, max: number): number => {
  if (position < 0) return 0;
  if (position > max) return max;
  return position;
};

/** 加载弹窗唤醒按钮位置 */
export const openButtonPosition = async () => {
  const { openButtonTop, openButtonLeft } = await myStorage.getConfig();
  const domFind = domById('CTZ_OPEN_BUTTON');
  if (!domFind) return;
  // 设置按钮拖动
  const maxLeft = window.innerWidth - domFind.offsetWidth;
  const maxTop = window.innerHeight - domFind.offsetHeight;
  const innerLeft = positionOne(openButtonLeft, maxLeft);
  const innerTop = positionOne(openButtonTop, maxTop);
  domFind.style.cssText += `top: ${innerTop}px; left: ${innerLeft}px;`;
  let startX = 0;
  let startY = 0;
  let x = 0; // 盒子的原始位置
  let y = 0; //
  domFind.addEventListener('touchstart', function (e) {
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;
    x = this.offsetLeft;
    y = this.offsetTop;
    this.style.transition = ''
  });
  domFind.addEventListener('touchmove', function (e) {
    let moveX = e.targetTouches[0].pageX - startX;
    let moveY = e.targetTouches[0].pageY - startY;
    const left = x + moveX;
    const top = y + moveY;
    this.style.left = positionOne(left, maxLeft) + 'px';
    this.style.top = positionOne(top, maxTop) + 'px';
    e.preventDefault();
  });
  domFind.addEventListener('touchend', async function () {
    const left = this.offsetLeft > maxLeft / 2 ? maxLeft : 0;
    this.style.left = `${left}px`;
    this.style.transition = 'all 0.5s';
    const top = this.offsetTop;
    await myStorage.updateConfig({
      openButtonTop: top,
      openButtonLeft: left,
    });
  });
};
