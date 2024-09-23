import { myStorage } from '../commons/storage';
import { domById, domC } from '../commons/tools';

const ID_TOP_SEARCH_BUTTON = 'CTZ_TOP_SEARCH_BUTTON';
const ID_TOP_SEARCH_INPUT = 'CTZ_TOP_SEARCH_INPUT';
const ID_TOP_SEARCH = 'CTZ_TOP_SEARCH';

export const fnHaveTopSearch = async () => {
  if (location.pathname === '/search') return; // 搜索页不显示
  const { haveTopSearch } = await myStorage.getConfig();
  const domFind = domById(ID_TOP_SEARCH);
  if (haveTopSearch) {
    if (domFind) return;
    const domSearch = domC('div', {
      id: ID_TOP_SEARCH,
      innerHTML: `<input type="text" placeholder="搜索内容" id="${ID_TOP_SEARCH_INPUT}" /><button id="${ID_TOP_SEARCH_BUTTON}">搜索</button>`,
    });
    const domRoot = domById('root');
    if (domRoot) {
      document.body.insertBefore(domSearch, domRoot);
      domById(ID_TOP_SEARCH_BUTTON)!.onclick = function () {
        const inputValue = (domById(ID_TOP_SEARCH_INPUT) as HTMLInputElement).value.trim();
        if (inputValue) {
          window.open(`https://www.zhihu.com/search?q=${encodeURIComponent(inputValue)}&type=content`);
        }
      };
      return;
    }
    setTimeout(() => {
      fnHaveTopSearch();
    }, 500);
  } else {
    domFind && domFind.remove();
    return;
  }
};
