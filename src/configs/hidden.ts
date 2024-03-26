import { IOptionItem } from '../types';

/** 屏蔽带有标签的回答 */
export const HIDDEN_ANSWER_TAG: Record<string, string> = {
  removeFromYanxuan: '盐选专栏',
  removeUnrealAnswer: '虚构创作',
  removeFromEBook: '电子书',
};

/** 屏蔽账号回答 */
export const HIDDEN_ANSWER_ACCOUNT: Record<string, string> = {
  removeStoryAnswer: '故事档案局',
  removeYanxuanAnswer: '盐选科普',
  removeYanxuanRecommend: '盐选推荐',
  removeYanxuanCPRecommend: '盐选测评室',
};

// 勾选隐藏对应内容
export const HIDDEN_ARRAY: IOptionItem[][] = [
  [{ value: 'hiddenAD', label: '广告' }],
  [
    { value: 'hiddenOpenApp', label: '隐藏跳转APP的提示和按钮' },
    { value: 'hiddenReward', label: '隐藏赞赏按钮' },
  ],
  [
    { value: 'hiddenLogo', label: '隐藏LOGO' },
    { value: 'hiddenHeader', label: '隐藏顶部悬浮模块' },
    { value: 'hiddenBottomSticky', label: '隐藏底部悬浮操作栏' },
    { value: 'hiddenCommitImg', label: '隐藏评论区图片' },
  ],
  [
    { value: 'hiddenAnswers', label: '隐藏列表回答内容' },
    { value: 'hiddenListVideoContent', label: '隐藏列表视频回答的内容' },
    { value: 'hiddenListImg', label: '隐藏列表图片' },
    { value: 'hiddenReadMoreText', label: '隐藏列表「阅读全文」文字' },
  ],
  [
    { value: 'hiddenItemActions', label: '隐藏列表回答操作栏' },
    { value: 'hiddenAnswerItemActions', label: '隐藏详情回答操作栏' },
  ],
  [
    { value: 'hiddenQuestionFollowing', label: '隐藏关注问题按钮' },
    { value: 'hiddenQuestionAnswer', label: '隐藏问题写回答按钮' },
  ],
  [
    { value: 'hiddenAnswerItemTime', label: '隐藏回答底部发布编辑时间和IP' },
    { value: 'hiddenAnswerItemTimeButHaveIP', label: '隐藏回答底部发布编辑时间（保留IP）' },
  ],
  [
    { value: 'hiddenDetailAvatar', label: '隐藏回答人头像' },
    { value: 'hiddenDetailName', label: '隐藏回答人姓名' },
    { value: 'hiddenDetailBadge', label: '隐藏回答人简介' },
    { value: 'hiddenDetailVoters', label: '隐藏回答人下赞同数' },
    { value: 'hiddenWhoVoters', label: '隐藏回答人下 你赞同过、XXX赞同了 等信息' },
  ],
  [
    { value: 'hiddenZhuanlanAvatarWrapper', label: '隐藏文章作者头像' },
    { value: 'hiddenZhuanlanAuthorInfoHead', label: '隐藏文章作者姓名' },
    { value: 'hiddenZhuanlanAuthorInfoDetail', label: '隐藏文章作者简介' },
    { value: 'hiddenZhuanlanFollowButton', label: '隐藏文章作者关注按钮' },
    { value: 'hiddenZhuanlanTitleImage', label: '隐藏文章标题图片' },
    { value: 'hiddenZhuanlanImage', label: '隐藏文章内容图片' },
    { value: 'hiddenZhuanlanActions', label: '隐藏文章底部悬浮操作栏' },
  ],
  [
    {value: 'hiddenAnswerYanxuanRecommend', label: '隐藏回答页盐选推荐'},
    {value: 'hiddenAnswerRelatedRecommend', label: '隐藏回答页相关推荐'},
    {value: 'hiddenAnswerHotRecommend', label: '隐藏回答页热门推荐'},
  ]
];
