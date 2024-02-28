import { myStorage } from "../commons/storage";
import { copy, dom, message } from "../commons/tools";
import { CONFIG_DEFAULT, NAME_CONFIG } from "../configs";
import { onInitStyleExtra } from "../init/init-style-extra";
import { IKeyofHistory } from "../types";
import { myCustomStyle, onUseThemeDark } from "./background";
import { echoData } from "./echo-data";
import { echoHistory } from "./history";

/** 编辑器按钮点击事件集合 */
export const myButtonOperate: Record<string, Function> = {
  /** 清空历史记录 */
  buttonHistoryClear: async (target: HTMLElement) => {
    const prevHistory = await myStorage.getHistory();
    const dataId = target.getAttribute('data-id') as IKeyofHistory;
    const isClear = confirm(`是否清空${target.innerText}`);
    if (!isClear) return;
    prevHistory[dataId] = [];
    await myStorage.setHistory(prevHistory);
    echoHistory();
  },
  /** 获取当前配置 */
  configExport: async () => {
    const config = (await myStorage.get(NAME_CONFIG)) ?? '';
    copy(config);
    message('已复制当前配置');
  },
  /** 恢复默认配置 */
  configReset: async function () {
    const isUse = confirm('是否启恢复默认配置？\n该功能会覆盖当前配置，建议先将配置获取保存');
    if (!isUse) return;
    const { filterKeywords = [], removeBlockUserContentList = [] } = await myStorage.getConfig();
    await myStorage.setConfig({
      ...CONFIG_DEFAULT,
      filterKeywords,
      removeBlockUserContentList,
    });
    resetData();
  },
  /** 导入配置 */
  configImport: async function () {
    const nodeImport = dom('[name=textConfigImport]');
    const configImport = nodeImport ? nodeImport.value : '{}';
    const configThis = JSON.parse(configImport);
    const configPrev = await myStorage.getConfig();
    const nConfig = {
      ...configPrev,
      ...configThis,
    };
    await myStorage.setConfig(nConfig);
    resetData();
    message('配置已导入');
  },
  /** 自定义样式 */
  styleCustom: async function () {
    const nodeText = dom('[name="textStyleCustom"]');
    const value = nodeText ? nodeText.value : '';
    await myStorage.updateConfig('customizeCss', value);
    myCustomStyle.change(value);
  },
  styleCustomReset: async function () {
    (dom('[name="textStyleCustom"]')!.value as string) = '';
    await myStorage.updateConfig('customizeCss', '');
    myCustomStyle.change('');
  },
};

/** 在重置数据时调用 */
const resetData = () => {
  onInitStyleExtra();
  echoData();
  onUseThemeDark();
};
