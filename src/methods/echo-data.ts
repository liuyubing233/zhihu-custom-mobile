import { myStorage } from '../commons/storage';
import { dom, domA, domById } from '../commons/tools';
import { CLASS_INPUT_CHANGE, CLASS_INPUT_CLICK } from '../configs';

/** 回填数据，供每次打开使用 */
export const echoData = async () => {
  const pfConfig = await myStorage.getConfig();
  const textSameName: Record<string, Function> = {
    globalTitle: (e: HTMLInputElement) => (e.value = pfConfig.globalTitle || document.title),
    customizeCss: (e: HTMLInputElement) => (e.value = pfConfig.customizeCss || ''),
  };
  const echoText = (even: HTMLInputElement) => {
    textSameName[even.name] ? textSameName[even.name](even) : (even.value = pfConfig[even.name]);
  };
  const echo: Record<string, Function> = {
    radio: (even: HTMLInputElement) => pfConfig.hasOwnProperty(even.name) && even.value === pfConfig[even.name] && (even.checked = true),
    checkbox: (even: HTMLInputElement) => (even.checked = pfConfig[even.name] || false),
    text: echoText,
    number: echoText,
    range: (even: HTMLInputElement) => {
      const nValue = pfConfig[even.name];
      const nodeRange = dom(`[name="${even.name}"]`) as HTMLInputElement;
      const min = nodeRange && nodeRange.min;
      const rangeNum = isNaN(+nValue) || !(+nValue > 0) ? min : nValue;
      even.value = rangeNum;
      const nodeNewOne = domById(even.name);
      nodeNewOne && (nodeNewOne.innerText = rangeNum);
    },
  };
  const doEcho = (item: HTMLInputElement) => {
    echo[item.type] && echo[item.type](item);
  };
  const nodeArrInputClick = domA(`.${CLASS_INPUT_CLICK}`) as NodeListOf<HTMLInputElement>;
  for (let i = 0, len = nodeArrInputClick.length; i < len; i++) {
    doEcho(nodeArrInputClick[i]);
  }
  const nodeArrInputChange = domA(`.${CLASS_INPUT_CHANGE}`) as NodeListOf<HTMLInputElement>;
  for (let i = 0, len = nodeArrInputChange.length; i < len; i++) {
    doEcho(nodeArrInputChange[i]);
  }
};
