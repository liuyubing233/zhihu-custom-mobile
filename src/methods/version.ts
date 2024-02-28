import { myStorage } from '../commons/storage';
import { fnInitDomStyle, fnReturnStr } from '../commons/tools';
import { IConfig } from '../types';

/** 修改版心的 css */
export const myVersion = {
  init: async function () {
    const config = await myStorage.getConfig();
    fnInitDomStyle('CTZ_STYLE_VERSION', this.vQuestionTitleTag(config));
  },
  change: function () {
    this.init();
  },
  /** 内容标题添加类别显示 */
  vQuestionTitleTag: function ({ questionTitleTag }: IConfig) {
    const cssTag = 'margin-right:6px;font-weight:normal;display:inline;padding:2px 4px;border-radius:4px;font-size:12px;color:#ffffff';
    return fnReturnStr(
      `.AnswerItem .ContentItem-title::before{content:'问答';background:#ec7259}` +
        `.TopstoryItem .PinItem::before{content:'想法';background:#9c27b0;${cssTag}}.PinItem>.ContentItem-title{margin-top:4px;}` +
        `.ZvideoItem .ContentItem-title::before{content:'视频';background:#12c2e9}.ZVideoItem .ContentItem-title::before{content:'视频';background:#12c2e9}` +
        `.ArticleItem .ContentItem-title::before{content:'文章';background:#00965e}` +
        `.ContentItem .ContentItem-title::before{margin-right:6px;font-weight:normal;display:inline;padding:2px 4px;border-radius:4px;font-size:12px;color:#ffffff}` +
        `.TopstoryQuestionAskItem .ContentItem-title::before{content:'提问';background:#533b77}`,
      questionTitleTag
    );
  },
};
