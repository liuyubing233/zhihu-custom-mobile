/** 基础设置 - 显示设置部分 */
export const BASIC_SHOW_CONTENT = [
  { label: '隐藏修改器唤起按钮，可在脚本菜单<b>⚙️ 设置</b>打开', value: 'openButtonInvisible'},
  { label: '<b>回答、文章</b>显示完整内容和评论', value: 'showAllContent'},
  {
    label:
      `<b>列表</b>标题类别显示` +
      `<span class="ctz-label-tag ctz-label-tag-Answer">问答</span>` +
      `<span class="ctz-label-tag ctz-label-tag-Article">文章</span>` +
      `<span class="ctz-label-tag ctz-label-tag-ZVideo">视频</span>` +
      `<span class="ctz-label-tag ctz-label-tag-Pin">想法</span>`,
    value: 'questionTitleTag',
    needFetch: false,
  },
  // { label: '<b>收起</b>按钮悬浮', value: 'suspensionPickup' },
  { label: '<b>列表</b>内容置顶创建和修改时间', value: 'releaseTimeForList' },
  { label: '<b>问题详情</b>置顶创建和修改时间', value: 'releaseTimeForQuestion' },
  { label: '<b>问题详情回答</b>置顶创建和修改时间', value: 'releaseTimeForAnswer' },
  { label: '<b>文章</b>置顶创建时间', value: 'releaseTimeForArticle' },
  { label: '一键获取内容链接', value: 'copyAnswerLink' },
  { label: '<b>问题详情</b>显示<b>查看问题日志</b>按钮', value: 'showQuestionLog' },
];
