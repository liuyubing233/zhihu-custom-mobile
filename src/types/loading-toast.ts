import { domById } from '../commons/tools';

/** 加载中提示 */
export const myLoadingToast = {
  open: () => (domById('CTZ_LOADING_TOAST')!.style.display = 'flex'),
  hide: () => (domById('CTZ_LOADING_TOAST')!.style.display = 'none'),
};
