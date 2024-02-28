/** 主题风格 */
export enum ETheme {
  浅色 = '0',
  深色 = '1',
  自动 = '2',
}

/** 主题风格 - 浅色 */
export enum EThemeLight {
  默认 = '0',
  红 = '1',
  黄 = '2',
  绿 = '3',
  灰 = '4',
  紫 = '5',
}

/** 主题风格 - 深色 */
export enum EThemeDark {
  默认 = '0',
  夜间护眼一 = '1',
  夜间护眼二 = '2',
  夜间护眼三 = '3',
}

/** 浅色主题色配置 */
export type IThemeConfigLight = Record<EThemeLight, IThemeValue>;
/** 深色主题色配置 */
export type IThemeConfigDark = Record<EThemeDark, IThemeValue>;

export interface IThemeValue {
  /** 名称 */
  name: string;
  /** 字体颜色 */
  color?: string;
  /** 背景色 */
  background: string;
  /** 第二背景色 */
  background2: string;
}
