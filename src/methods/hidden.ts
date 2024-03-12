import { myStorage } from '../commons/storage';
import { fnInitDomStyle } from '../commons/tools';

const DN = 'display:none!important;';
const VH = 'visibility: hidden!important;';

/** 隐藏元素的 css */
export const myHidden: IMyHidden = {
  init: async function () {
    const content = await this.change();
    fnInitDomStyle('CTZ_STYLE_HIDDEN', content || '');
  },
  change: async function () {
    const config = await myStorage.getConfig();
    const cssHidden = Object.keys(this.hiddenItem)
      .map((key) => (config[key] ? this.hiddenItem[key] : ''))
      .join('');
    let cssHiddenMore = '';
    this.hiddenArray.forEach(({ keys, value }) => {
      let trueNumber = 0;
      keys.forEach((key) => config[key] && trueNumber++);
      trueNumber === keys.length && (cssHiddenMore += value);
    });
    return cssHidden + cssHiddenMore;
  },
  hiddenItem: {
    hiddenOpenApp: `.OpenInAppButton{${DN}}.css-183aq3r{${VH}}`,
    hiddenLogo: `.MobileAppHeader-logo,a[aria-label="知乎"]{${VH}}`,
    hiddenHeader: `.MobileAppHeader,.ColumnPageHeader.Sticky{${DN}}`,
    hiddenItemActions: `.TopstoryItem .ContentItem-actions:not(.Sticky),.SearchMain .ContentItem-actions{${DN}}`,
    hiddenBottomSticky: `.ContentItem-actions.Sticky{${DN}}`,
    hiddenReward: `.Reward{${DN}}`,
    hiddenListImg: `.RichContent-cover,.css-uw6cz9,.SearchItem-rightImg{${DN}}`,
    hiddenReadMoreText: '.ContentItem-more{font-size:0!important;}',
    hiddenAnswers: `.RichContent-inner,.css-3ny988,.Topstory-recommend .VideoAnswerPlayer{${DN}}`,
    hiddenListVideoContent: `.Topstory-recommend .ZVideoItem-video,.Topstory-recommend .VideoAnswerPlayer,.Topstory-recommend .ZVideoItem .RichContent{${DN}}`,
    hiddenZhuanlanActions: `.zhuanlan .RichContent-actions.is-fixed>.ContentItem-actions{${DN}}`,
    hiddenZhuanlanTitleImage:
      '.css-1ntkiwo,.TitleImage,.css-78p1r9,.ArticleItem .RichContent>div:first-of-type:not(.RichContent-cover)>div:last-of-type{display: none!important;}',
    hiddenDetailAvatar: `.AnswerItem .AuthorInfo .AuthorInfo-avatarWrapper{${DN}}` + `.AnswerItem .AuthorInfo .AuthorInfo-content{margin-left:0!important;}`,
    hiddenDetailBadge: `.AnswerItem .AuthorInfo .AuthorInfo-detail{${DN}}`,
    hiddenDetailVoters: `.css-dvccr2{${DN}}`,
    hiddenWhoVoters: '.css-1vqda4a{display: none!important;}',
    hiddenDetailName: `.AnswerItem .AuthorInfo .AuthorInfo-head{${DN}}`,
    hiddenQuestionFollowing: `.QuestionHeader .FollowButton{${DN}}`,
    hiddenQuestionAnswer: `.QuestionHeader .FollowButton ~ a{${DN}}`,
    hiddenZhuanlanFollowButton: `.zhuanlan .FollowButton{${DN}}`,
    hiddenZhuanlanAvatarWrapper: `.zhuanlan .AuthorInfo-avatarWrapper{${DN}}`,
    hiddenZhuanlanAuthorInfoHead: `.zhuanlan .AuthorInfo-head{${DN}}`,
    hiddenZhuanlanAuthorInfoDetail: `.zhuanlan .AuthorInfo-detail{${DN}}`,
    hiddenAnswerItemActions: `.Question-main .ContentItem-actions{${DN}}`,
    hiddenAnswerItemTime: `.Question-main .ContentItem-time{${DN}margin: 0;}`,
    hiddenAnswerItemTimeButHaveIP: `.Question-main .ContentItem-time>a{${DN}}.Question-main .ContentItem-time:empty{${DN}margin: 0;}`,
    hiddenZhuanlanImage: `.zhuanlan .origin_image{${DN}}`,
    hiddenCommitImg: `.comment_img{${DN}}`
  },
  hiddenArray: [],
};

interface IMyHidden {
  init: () => Promise<void>;
  change: () => Promise<string>;
  hiddenItem: Record<string, string>;
  hiddenArray: IHiddenArray[];
}

interface IHiddenArray {
  keys: string[];
  value: string;
}
