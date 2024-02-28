import { ETheme, EThemeDark, EThemeLight, IHistory } from '../types';
import { IConfig, IConfigFilter, IConfigHidden } from '../types/configs.type';

export const NAME_CONFIG = 'mobileConfig';
export const NAME_HISTORY = 'mobileHistory';

export const HISTORY_DEFAULT: IHistory = {
  view: [],
  list: [],
};

/** 隐藏内容模块默认为 true 的配置 */
export const CONFIG_HIDDEN_DEFAULT: IConfigHidden = {
  hiddenOpenApp: true,
  hiddenReadMoreText: true,
  hiddenReward: true,
};

/** 屏蔽内容模块默认配置 */
export const CONFIG_FILTER_DEFAULT: IConfigFilter = {};

/** 默认配置 */
export const CONFIG_DEFAULT: IConfig = {
  ...CONFIG_HIDDEN_DEFAULT,
  ...CONFIG_FILTER_DEFAULT,
  openButtonTop: 100,
  openButtonLeft: 0,
  questionTitleTag: true,
  releaseTimeForList: true,
  releaseTimeForAnswer: true,
  releaseTimeForQuestion: true,
  releaseTimeForArticle: true,
  theme: ETheme.自动,
  themeLight: EThemeLight.默认,
  themeDark: EThemeDark.夜间护眼一,
  copyAnswerLink: true,
  showQuestionLog: true,
};

/** 缓存的历史记录数量 */
export const SAVE_HISTORY_NUMBER = 500;
