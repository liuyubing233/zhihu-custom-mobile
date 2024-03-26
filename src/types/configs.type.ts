import { ETheme, EThemeDark, EThemeLight } from './background.type';

/** 隐藏内容模块配置 */
export interface IConfigHidden {
  /** 隐藏打开APP提示和按钮 */
  hiddenOpenApp?: boolean;
  /** 隐藏底部悬浮操作栏 */
  hiddenBottomSticky?: boolean;
  /** 隐藏logo */
  hiddenLogo?: boolean;
  /** 隐藏header */
  hiddenHeader?: boolean;
  /** 隐藏列表回答操作 */
  hiddenItemActions?: boolean;
  /** 隐藏赞赏按钮 */
  hiddenReward?: boolean;
  /** 隐藏问题列表图片 */
  hiddenListImg?: boolean;
  /** 隐藏阅读全文文字 */
  hiddenReadMoreText?: boolean;
  /** 隐藏问题列表回答内容 */
  hiddenAnswers?: boolean;
  /** 隐藏专栏下方操作条 */
  hiddenZhuanlanActions?: boolean;
  /** 隐藏专栏标题图片 */
  hiddenZhuanlanTitleImage?: boolean;
  /** 隐藏详情回答人头像 */
  hiddenDetailAvatar?: boolean;
  /** 隐藏详情回答人简介 */
  hiddenDetailBadge?: boolean;
  /** 隐藏详情回答人下赞同数 */
  hiddenDetailVoters?: boolean;
  /** 回答隐藏用户信息下的附加信息，例如：「你赞同过」 */
  hiddenWhoVoters?: boolean;
  /** 隐藏详情回答人姓名 */
  hiddenDetailName?: boolean;
  /** 隐藏关注问题按钮 */
  hiddenQuestionFollowing?: boolean;
  /** 隐藏写回答按钮 */
  hiddenQuestionAnswer?: boolean;
  /** 隐藏文章作者关注按钮 */
  hiddenZhuanlanFollowButton?: boolean;
  /** 隐藏文章作者头像 */
  hiddenZhuanlanAvatarWrapper?: boolean;
  /** 隐藏文章作者姓名 */
  hiddenZhuanlanAuthorInfoHead?: boolean;
  /** 隐藏文章作者简介 */
  hiddenZhuanlanAuthorInfoDetail?: boolean;
  /** 隐藏列表视频回答的内容 */
  hiddenListVideoContent?: boolean;
  /** 隐藏回答内容操作栏 */
  hiddenAnswerItemActions?: boolean;
  /** 隐藏回答下方发布编辑时间 */
  hiddenAnswerItemTime?: boolean;
  /** 回答底部发布编辑时间（保留IP） */
  hiddenAnswerItemTimeButHaveIP?: boolean;
  /** 隐藏文章内容图片 */
  hiddenZhuanlanImage?: boolean;
  /** 隐藏评论区图片 */
  hiddenCommitImg?: boolean;
  /** 隐藏广告 */
  hiddenAD?: boolean;
}

/** 自定义黑名单列表内容 */
export interface IBlockUserItem {
  avatar?: string;
  id?: string;
  name?: string;
  urlToken?: string;
  userType?: string;
}

/** 屏蔽内容模块默认配置 */
export interface IConfigFilter {
  /** 屏蔽知乎官方账号回答 */
  removeZhihuOfficial?: boolean;
  /** 屏蔽故事档案局回答 */
  removeStoryAnswer?: boolean;
  /** 屏蔽盐选科普回答 */
  removeYanxuanAnswer?: boolean;
  /** 屏蔽盐选推荐 */
  removeYanxuanRecommend?: boolean;
  /** 屏蔽盐选测评室 */
  removeYanxuanCPRecommend?: boolean;
  /** 屏蔽选自盐选专栏的回答 */
  removeFromYanxuan?: boolean;
  /** 屏蔽带有虚构内容的回答 */
  removeUnrealAnswer?: boolean;
  /** 屏蔽关注人赞同回答 */
  removeFollowVoteAnswer?: boolean;
  /** 屏蔽关注人赞同文章 */
  removeFollowVoteArticle?: boolean;
  /** 屏蔽关注人关注问题 */
  removeFollowFQuestion?: boolean;
  /** 屏蔽不再显示黑名单用户发布的内容 */
  removeBlockUserContent?: boolean;
  /** 屏蔽已屏蔽用户列表 */
  removeBlockUserContentList?: IBlockUserItem[];
  /** 屏蔽商业推广 */
  removeItemAboutAD?: boolean;
  /** 屏蔽文章 */
  removeItemAboutArticle?: boolean;
  /** 屏蔽视频 */
  removeItemAboutVideo?: boolean;
  /** 列表屏蔽想法 */
  removeItemAboutPin?: boolean;
  /** 屏蔽列表提问 */
  removeItemQuestionAsk?: boolean;
  /** 关注列表过滤低于以下赞的内容 */
  removeLessVote?: boolean;
  /** 关注列表过滤低于以下赞的内容 */
  lessVoteNumber?: number;
  /** 回答低赞内容屏蔽 */
  removeLessVoteDetail?: boolean;
  /** 回答详情屏蔽以下赞的内容 */
  lessVoteNumberDetail?: number;
  /** 屏蔽匿名用户回答 */
  removeAnonymousAnswer?: boolean;
  /** 关注列表屏蔽自己的操作 */
  removeMyOperateAtFollow?: boolean;
  /** 屏蔽顶部活动推广 */
  removeTopAD?: boolean;
  /** 屏蔽标签选自电子书的回答 */
  removeFromEBook?: boolean;
  /** 隐藏盐选推荐 */
  hiddenAnswerYanxuanRecommend?: boolean;
  /** 隐藏回答页相关推荐 */
  hiddenAnswerRelatedRecommend?: boolean;
  /** 隐藏回答页热门推荐 */
  hiddenAnswerHotRecommend?: boolean;
}

/** 配置参数 */
export interface IConfig extends IConfigHidden, IConfigFilter {
  [key: string]: any;
  /** 修改器唤醒按钮的位置 top */
  openButtonTop: number;
  /** 修改器唤醒按钮的位置 left */
  openButtonLeft: number;
  /** 长回答和列表收起按钮悬浮*/
  suspensionPickup?: boolean;
  /** 隐藏修改器唤起按钮（可在脚本菜单处<b>⚙️ 设置</b>打开） */
  openButtonInvisible?: boolean;

  // /** 是否开启接口拦截，默认开启 */
  // fetchInterceptStatus?: boolean;
  /** 自定义样式 */
  customizeCss?: string;
  // /** 知乎默认 | 自动展开所有回答 | 默认收起所有长回答 */
  // answerOpen?: '' | 'on' | 'off';
  // /** 屏蔽词方法：列表标题屏蔽 */
  // filterKeywords?: string[];
  // /** 屏蔽词方法：回答内容屏蔽 */
  // blockWordsAnswer?: string[];
  // /** 列表用户名后显示「屏蔽用户」按钮 */
  // showBlockUser?: boolean;
  // /** 列表页面内容宽度 */
  // versionHome?: string;
  // /** 列表页面内容宽度是否使用百分比 */
  // versionHomeIsPercent?: boolean;
  // /** 列表页面内容宽度百分比内容 */
  // versionHomePercent?: string;
  // /** 回答页面内容宽度 */
  // versionAnswer?: string;
  // /** 回答页面内容宽度是否使用百分比 */
  // versionAnswerIsPercent?: boolean;
  // /** 回答页面内容宽度百分比内容 */
  // versionAnswerPercent?: string;
  // /** 文章页面内容宽度 */
  // versionArticle?: string;
  // /** 文章页面内容宽度是否使用百分比 */
  // versionArticleIsPercent?: boolean;
  // /** 文章页面内容宽度百分比内容 */
  // versionArticlePercent?: string;
  // /** 图片尺寸自定义类型 0 1 2 */
  // zoomImageType?: '0' | '1' | '2';
  // /** 图片尺寸自定义大小 */
  // zoomImageSize?: string;
  // /** 使用弹窗打开动图 */
  // showGIFinDialog?: boolean;
  // /** 网页标题 */
  // globalTitle?: string;
  // /** 网页标题logo图 */
  // titleIco?: string;
  /** 内容标题添加类别标签 */
  questionTitleTag?: boolean;
  // /** 推荐列表外置「不感兴趣」按钮 */
  // listOutPutNotInterested?: boolean;
  // /** 列表更多按钮固定至题目右侧 */
  // fixedListItemMore?: boolean;
  // /** 关注列表高亮原创内容 */
  // highlightOriginal?: boolean;
  // /** 列表内容点击高亮边框 */
  // highlightListItem?: boolean;
  /** 列表内容显示发布与最后修改时间 */
  releaseTimeForList?: boolean;
  /** 回答列表显示创建与最后修改时间 */
  releaseTimeForAnswer?: boolean;
  /** 问题显示创建和最后修改时间 */
  releaseTimeForQuestion?: boolean;
  /** 文章发布时间置顶 */
  releaseTimeForArticle?: boolean;
  // /** 购物链接显示设置 0 1 2 */
  // linkShopping?: '0' | '1' | '2';
  // /** 列表标题文字大小 */
  // fontSizeForListTitle?: number;
  // /** 回答标题文字大小 */
  // fontSizeForAnswerTitle?: number;
  // /** 文章标题文字大小 */
  // fontSizeForArticleTitle?: number;
  // /** 列表内容标准文字大小 */
  // fontSizeForList?: number;
  // /** 回答内容标准文字大小 */
  // fontSizeForAnswer?: number;
  // /** 文章内容标准文字大小 */
  // fontSizeForArticle?: number;
  // /** 列表视频回答内容尺寸 */
  // zoomListVideoType?: string;
  // /** 列表视频回答内容缩放 */
  // zoomListVideoSize?: string;
  // /** 唤醒快捷键是否开启 */
  // hotKey?: boolean;
  /** 颜色主题 浅色、深色、自动 */
  theme?: ETheme;
  /** 浅色主题选择的样式 */
  themeLight?: EThemeLight;
  /** 深色主题选择的样式 */
  themeDark?: EThemeDark;
  // /** 字体颜色 */
  // colorText1?: '';
  // /** 回答操作 - 赞同按钮仅显示赞同数 */
  // justVoteNum?: boolean;
  // /** 回答操作 - 评论按钮仅显示评论数 */
  // justCommitNum?: boolean;
  // /** 内容顶部是否显示赞同数 */
  // topVote?: boolean;
  // /** 文档或回答顶部显示导出当前内容/回答按钮 */
  // topExportContent?: boolean;
  // /** 回答内容中的视频回答替换为视频链接 */
  // videoUseLink?: boolean;
  // /** 弹窗宽度匹配相应页面 */
  // commitModalSizeSameVersion?: boolean;
  // /** 推荐列表显示「直达问题」按钮 */
  // listOutputToQuestion?: boolean;
  // /** 用户主页内容发布、修改时间置顶 */
  // userHomeContentTimeTop?: boolean;
  // /** 用户主页置顶「屏蔽用户」按钮 */
  // userHomeTopBlockUser?: boolean;
  /** 问题详情显示查看问题日志按钮 */
  showQuestionLog?: boolean;
  /** 一键获取回答链接 */
  copyAnswerLink?: boolean;
  /** 时间戳 */
  t?: number;
  /** 回答、文章显示完整内容和评论 */
  showAllContent?: boolean;
}
