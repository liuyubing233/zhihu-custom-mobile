import { domA } from '../commons/tools';

/** 知乎外链直接打开(修改外链内容，去除知乎重定向) */
export const initLinkChanger = () => {
  const esName = ['a.external', 'a.LinkCard'];
  const operaLink = 'is-link-changed';
  const hrefChanger = (item: HTMLAnchorElement) => {
    const hrefFormat = item.href.replace(/^(https|http):\/\/link\.zhihu\.com\/\?target\=/, '') || '';
    let href = '';
    // 解决 hrefFormat 格式已经是 decode 后的格式
    try {
      href = decodeURIComponent(hrefFormat);
    } catch {
      href = hrefFormat;
    }
    item.href = href;
    item.classList.add(operaLink);
  };
  for (let i = 0, len = esName.length; i < len; i++) {
    const name = esName[i];
    const links = domA(`${name}:not(.${operaLink})`);
    for (let index = 0, linkLen = links.length; index < linkLen; index++) {
      hrefChanger(links[index] as HTMLAnchorElement);
    }
  }
};
