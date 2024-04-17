export interface IZhihuAnswerResponse {
  data: IZhihuAnswerDataItem[];
  session: IZhihuAnswerSession;
  paging: IZhihuPaging;
}

export interface IZhihuAnswerDataItem {
  type?: string;
  targetType: string;
  target: IZhihuAnswerTarget;
  skipCount?: boolean;
  position?: number;
  cursor?: string;
  isJumpNative?: boolean;
}

export interface IZhihuAnswerTarget {
  adminClosed_comment: boolean;
  annotationAction: null;
  answerType: string;
  attachedInfo: string;
  author: Author;
  canComment: CanComment;
  collapseReason: string;
  collapsedBy: string;
  commentCount: number;
  commentPermission: string;
  content: string;
  contentMark: ContentMark;
  createdTime: number;
  decorativeLabels: any[];
  editableContent: string;
  excerpt: string;
  extras: string;
  id: number;
  isCollapsed: boolean;
  isCopyable: boolean;
  isJumpNative: boolean;
  isLabeled: boolean;
  isMine: boolean;
  isNormal: boolean;
  isSticky: boolean;
  isVisible: boolean;
  question: Question;
  reactionInstruction: ContentMark;
  relationship: Relationship;
  relevantInfo: RelevantInfo;
  reshipmentSettings: string;
  rewardInfo: RewardInfo;
  stickyInfo: string;
  suggestEdit: SuggestEdit;
  thanksCount: number;
  thumbnailInfo: ThumbnailInfo;
  type: string;
  updatedTime: number;
  url: string;
  visibleOnlyToAuthor: boolean;
  voteupCount: number;
  zhiPlusExtraInfo: string;
  labelInfo: ILabelInfo;
}

export interface ILabelInfo {
  foregroundColor: ForegroundColor;
  iconUrl: string;
  text: string;
  type: string;
}

export interface ForegroundColor {
  alpha: number;
  group: string;
}

export interface Author {
  avatarUrl: string;
  avatarUrlTemplate: string;
  badge: any[];
  badgeV2: BadgeV2;
  exposedMedal: ExposedMedal;
  followerCount: number;
  gender: number;
  headline: string;
  id: string;
  isAdvertiser: boolean;
  isFollowed: boolean;
  isFollowing: boolean;
  isOrg: boolean;
  isPrivacy: boolean;
  name: string;
  type: string;
  url: string;
  urlToken: string;
  userType: string;
}

export interface BadgeV2 {
  detailBadges: any[];
  icon: string;
  mergedBadges: any[];
  nightIcon: string;
  title: string;
}

export interface ExposedMedal {
  avatarUrl: string;
  description: string;
  medalId: string;
  medalName: string;
  medalAvatarFrame?: string;
  miniAvatarUrl?: string;
}

export interface CanComment {
  reason: string;
  status: boolean;
}

export interface ContentMark {}

export interface Question {
  created: number;
  id: number;
  questionType: string;
  relationship: ContentMark;
  title: string;
  type: string;
  updatedTime: number;
  url: string;
}

export interface Relationship {
  isAuthor: boolean;
  isAuthorized: boolean;
  isNothelp: boolean;
  isThanked: boolean;
  upvotedFollowees: any[];
  voting: number;
}

export interface RelevantInfo {
  isRelevant: boolean;
  relevantText: string;
  relevantType: string;
}

export interface RewardInfo {
  canOpenReward: boolean;
  isRewardable: boolean;
  rewardMemberCount: number;
  rewardTotalMoney: number;
  tagline: string;
}

export interface SuggestEdit {
  reason: string;
  status: boolean;
  tip: string;
  title: string;
  unnormalDetails: UnnormalDetails;
  url: string;
}

export interface UnnormalDetails {
  description: string;
  note: string;
  reason: string;
  reasonId: number;
  status: string;
}

export interface ThumbnailInfo {
  count: number;
  thumbnails: any[];
  type: string;
}

export interface IZhihuPaging {
  page: number;
  isEnd: boolean;
  next: string;
}

export interface IZhihuAnswerSession {
  id: string;
}
