/**
 * 评论接口返回值
 */
export interface IZhihuCommentResponse {
  commentStatus: ICommentStatus;
  counts: ICommentCounts;
  data: ICommentData[];
  editStatus: ICommentEditStatus;
  header: any[];
  isContentAuthor: boolean;
  paging: ICommentPaging;
  sorter: ICommentSorter[];
}

export interface ICommentStatus {
  type: number;
  text: string;
  induceText: string;
}

export interface ICommentCounts {
  totalCounts: number;
  collapsedCounts: number;
  reviewingCounts: number;
}

export interface ICommentData {
  id: string;
  type: ChildCommentType;
  resourceType: ResourceType;
  memberId: number;
  url: string;
  hot: boolean;
  top: boolean;
  content: string;
  score: number;
  createdTime: number;
  isDelete: boolean;
  collapsed: boolean;
  reviewing: boolean;
  replyCommentId: string;
  replyRootCommentId: string;
  liked: boolean;
  likeCount: number;
  disliked: boolean;
  dislikeCount: number;
  isAuthor: boolean;
  canLike: boolean;
  canDislike: boolean;
  canDelete: boolean;
  canReply: boolean;
  canHot: boolean;
  canAuthorTop: boolean;
  isAuthorTop: boolean;
  canCollapse: boolean;
  canShare: boolean;
  canUnfold: boolean;
  canTruncate: boolean;
  canMore: boolean;
  author: DatumAuthor;
  replyToAuthor?: DatumAuthor;
  authorTag: IAuthorTag[];
  replyAuthorTag: any[];
  contentTag: any[];
  commentTag: any[];
  childCommentCount: number;
  childCommentNextOffset: null | string;
  childComments?: ICommentData[];
  isVisibleOnlyToMyself: boolean;
  _: null;
}

export interface IAuthorTag {
  borderColor: string;
  borderNightColor: string;
  color: string;
  hasBorder: boolean;
  nightColor: string;
  text: string;
  type: string;
}

export interface DatumAuthor {
  id: string;
  urlToken: string;
  name: string;
  avatarUrl: string;
  avatarUrlTemplate: string;
  isOrg: boolean;
  type: UserTypeEnum;
  url: string;
  userType: UserTypeEnum;
  headline: string;
  gender: number;
  isAdvertiser: boolean;
  badgeV2: BadgeV2;
  exposedMedal: ExposedMedal;
  vipInfo: PurpleVipInfo;
  levelInfo: null;
  isAnonymous: boolean;
}

export interface BadgeV2 {
  title: string;
  mergedBadges: null;
  detailBadges: null;
}

export interface ExposedMedal {
  medalId: string;
  medalName: MedalName;
  avatarUrl: string;
  description: string;
  medalAvatar_frame: string;
  canClick: boolean;
  miniAvatarUrl?: string;
}

export enum MedalName {
  Empty = '',
  乐于交流 = '乐于交流',
  好奇宝宝 = '好奇宝宝',
  有口皆碑 = '有口皆碑',
}

export enum UserTypeEnum {
  People = 'people',
}

export interface PurpleVipInfo {
  isVip: boolean;
  vipIcon?: VipIcon;
}

export interface VipIcon {
  url: string;
  nightModeUrl: string;
}

export enum ResourceType {
  Answer = 'answer',
}

export enum ChildCommentType {
  Comment = 'comment',
}

export interface ICommentEditStatus {
  canReply: boolean;
  toast: string;
}

export interface ICommentPaging {
  isEnd: boolean;
  isStart: boolean;
  next: string;
  previous: string;
  totals: number;
}

export interface ICommentSorter {
  type: string;
  text: string;
}
