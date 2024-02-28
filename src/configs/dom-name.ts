import { IOptionItem } from '../types';

export const HTML_HOOTS = ['www.zhihu.com', 'zhuanlan.zhihu.com'];

/** id: 同步黑名单按钮 */
export const ID_BUTTON_SYNC_BLOCK = 'CTZ-BUTTON-SYNC-BLOCK';
/** class: INPUT 点击元素类名 */
export const CLASS_INPUT_CLICK = 'ctz-i';
/** class: INPUT 修改操作元素类名 */
export const CLASS_INPUT_CHANGE = 'ctz-i-change';
/** class: 黑名单元素删除按钮类名 */
export const CLASS_REMOVE_BLOCK = 'ctz-remove-block';
/** class: 不感兴趣外置按钮 */
export const CLASS_NOT_INTERESTED = 'ctz-not-interested';
/** class: 推荐列表显示「直达问题」按钮 */
export const CLASS_TO_QUESTION = 'ctz-to-question';
/** class: 自定义的时间元素名称 */
export const CLASS_TIME_ITEM = 'ctz-list-item-time';

/** html 添加额外的类名 */
export const EXTRA_CLASS_HTML: Record<string, string> = {
  'zhuanlan.zhihu.com': 'zhuanlan',
  'www.zhihu.com': 'zhihu',
};

export const HEADER = [
  { href: '#CTZ_BASIS', value: '基础设置' },
  { href: '#CTZ_HIDDEN', value: '隐藏模块' },
  // { href: '#CTZ_FILTER', value: '屏蔽内容' },
  // { href: '#CTZ_BLOCK_WORD', value: '屏蔽词' },
  // { href: '#CTZ_BLACKLIST', value: '黑名单' },
  { href: '#CTZ_HISTORY', value: '历史记录' },
  // { href: '#CTZ_DEFAULT', value: '默认功能' },
];

export const FONT_SIZE_INPUT: IOptionItem[][] = [
  [
    { value: 'fontSizeForListTitle', label: '列表标题文字大小' },
    { value: 'fontSizeForList', label: '列表内容文字大小' },
  ],
  [
    { value: 'fontSizeForAnswerTitle', label: '回答标题文字大小' },
    { value: 'fontSizeForAnswer', label: '回答内容文字大小' },
  ],
  [
    { value: 'fontSizeForArticleTitle', label: '文章标题文字大小' },
    { value: 'fontSizeForArticle', label: '文章内容文字大小' },
  ],
];
