import { myStorage } from '../commons/storage';
import { domById } from '../commons/tools';
import { INPUT_NAME_THEME, INPUT_NAME_THEME_DARK, INPUT_NAME_ThEME_LIGHT } from '../configs';
import { loadBackground, onUseThemeDark } from './background';
import { myHidden } from './hidden';
import { addTimeForArticle, addTimeForQuestion } from './time';
import { myVersion } from './version';

/** 更改编辑器方法 */
export const fnChanger = async (ev: HTMLInputElement) => {
  // onchange 时只调用 myVersion 的 name
  const doCssVersion = ['questionTitleTag', 'openButtonInvisible'];
  const { name, value, checked, type } = ev;
  const changeBackground = () => {
    myVersion.change();
    loadBackground();
    // myListenListItem.restart();
    onUseThemeDark();
  };

  const ob: Record<string, Function> = {
    [INPUT_NAME_THEME]: changeBackground,
    [INPUT_NAME_ThEME_LIGHT]: changeBackground,
    [INPUT_NAME_THEME_DARK]: changeBackground,
    releaseTimeForQuestion: addTimeForQuestion,
    releaseTimeForArticle: addTimeForArticle,
  };
  await myStorage.updateConfig(name, type === 'checkbox' ? checked : value);
  const nodeName = domById(name);
  type === 'range' && nodeName && (nodeName.innerText = value);
  if (/^hidden/.test(name)) {
    myHidden.init();
    return;
  }
  if (doCssVersion.includes(name)) {
    myVersion.change();
    return;
  }
  ob[name] && ob[name]();
};
