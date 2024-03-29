/** 背景色设置 */
import { ETheme, EThemeDark, EThemeLight, IThemeConfigDark, IThemeConfigLight } from '../types/background.type';

export const THEMES = [
  { label: '浅色', value: ETheme.浅色, background: '#fff', color: '#000' },
  { label: '深色', value: ETheme.深色, background: '#000', color: '#fff' },
  { label: '自动', value: ETheme.自动, background: 'linear-gradient(to right, #fff, #000)', color: '#000' },
];

export const THEME_CONFIG_LIGHT: IThemeConfigLight = {
  [EThemeLight.默认]: { name: '默认', background: '#ffffff', background2: '' },
  [EThemeLight.红]: { name: '红', background: '#ffe4c4', background2: '#fff4e7' },
  [EThemeLight.黄]: { name: '黄', background: '#faf9de', background2: '#fdfdf2' },
  [EThemeLight.绿]: { name: '绿', background: '#cce8cf', background2: '#e5f1e7' },
  [EThemeLight.灰]: { name: '灰', background: '#eaeaef', background2: '#f3f3f5' },
  [EThemeLight.紫]: { name: '紫', background: '#e9ebfe', background2: '#f2f3fb' },
};

export const THEME_CONFIG_DARK: IThemeConfigDark = {
  [EThemeDark.默认]: { name: '默认', color: '#fff', background: '#121212', background2: '#333333' },
  [EThemeDark.夜间护眼一]: { name: '夜间护眼一', color: '#f7f9f9', background: '#15202b', background2: '#38444d' },
  [EThemeDark.夜间护眼二]: { name: '夜间护眼二', color: '#f7f9f9', background: '#1f1f1f', background2: '#303030' },
  [EThemeDark.夜间护眼三]: { name: '夜间护眼三', color: '#f7f9f9', background: '#272822', background2: '#383932' },
};

export const INPUT_NAME_THEME = 'theme';
export const INPUT_NAME_THEME_DARK = 'themeDark';
export const INPUT_NAME_ThEME_LIGHT = 'themeLight';
