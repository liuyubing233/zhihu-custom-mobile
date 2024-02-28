import { CONFIG_DEFAULT, HISTORY_DEFAULT, NAME_CONFIG, NAME_HISTORY, SAVE_HISTORY_NUMBER } from '../configs';
import { IConfig, IHistory } from '../types';

/** 使用 localStorage + GM 存储，解决跨域存储配置不同的问题 */
export const myStorage = {
  set: async function (name: string, value: Record<string, any>) {
    value.t = +new Date();
    const v = JSON.stringify(value);
    localStorage.setItem(name, v);
    await GM.setValue(name, v);
  },
  get: async function (name: string) {
    const config = await GM.getValue(name);
    const configLocal = localStorage.getItem(name);
    const cParse = config ? JSON.parse(config) : null;
    const cLParse = configLocal ? JSON.parse(configLocal) : null;
    if (!cParse && !cLParse) return '';
    if (!cParse) return configLocal;
    if (!cLParse) return config;
    if (cParse.t < cLParse.t) return configLocal;
    return config;
  },
  getConfig: async function (): Promise<IConfig> {
    const nConfig = await this.get(NAME_CONFIG);
    const c = nConfig ? JSON.parse(nConfig) : {};
    const configSave = { ...CONFIG_DEFAULT, ...c };
    return Promise.resolve(configSave);
  },
  getHistory: async function (): Promise<IHistory> {
    const nHistory = await myStorage.get(NAME_HISTORY);
    const h = nHistory ? JSON.parse(nHistory) : HISTORY_DEFAULT;
    return Promise.resolve(h);
  },
  /** 修改配置中的值 */
  updateConfig: async function (key: string | Record<string, any>, value?: any) {
    const config = await this.getConfig();
    if (typeof key === 'string') {
      config[key] = value;
    } else {
      for (let itemKey in key) {
        config[itemKey] = key[itemKey];
      }
    }
    await this.set(NAME_CONFIG, config);
  },
  /** 更新配置 */
  setConfig: async function (params: IConfig) {
    await this.set(NAME_CONFIG, params);
  },
  setHistoryItem: async function (key: 'list' | 'view', params: string[]) {
    const pfHistory = await this.getHistory();
    pfHistory[key] = params.slice(0, SAVE_HISTORY_NUMBER);
    await this.set(NAME_HISTORY, pfHistory);
  },
  setHistory: async function (value: IHistory) {
    this.set(NAME_HISTORY, value);
  },
};
