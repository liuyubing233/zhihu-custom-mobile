/**
 * 评论接口返回值
 */
export interface IZhihuCommentResponse {
  comment_status: ICommentStatus;
  counts: ICommentCounts;
  data: ICommentData[];
  edit_status: ICommentEditStatus;
  header: any[];
  is_content_author: boolean;
  paging: ICommentPaging;
  sorter: ICommentSorter[];
}

export interface ICommentStatus {
  type: number;
  text: string;
  induce_text: string;
}

export interface ICommentCounts {
  total_counts: number;
  collapsed_counts: number;
  reviewing_counts: number;
}

export interface ICommentData {
  id: string;
  type: ChildCommentType;
  resource_type: ResourceType;
  member_id: number;
  url: string;
  hot: boolean;
  top: boolean;
  content: string;
  score: number;
  created_time: number;
  is_delete: boolean;
  collapsed: boolean;
  reviewing: boolean;
  reply_comment_id: string;
  reply_root_comment_id: string;
  liked: boolean;
  like_count: number;
  disliked: boolean;
  dislike_count: number;
  is_author: boolean;
  can_like: boolean;
  can_dislike: boolean;
  can_delete: boolean;
  can_reply: boolean;
  can_hot: boolean;
  can_author_top: boolean;
  is_author_top: boolean;
  can_collapse: boolean;
  can_share: boolean;
  can_unfold: boolean;
  can_truncate: boolean;
  can_more: boolean;
  author: DatumAuthor;
  reply_to_author?: DatumAuthor;
  author_tag: IAuthorTag[];
  reply_author_tag: any[];
  content_tag: any[];
  comment_tag: any[];
  child_comment_count: number;
  child_comment_next_offset: null | string;
  child_comments?: ICommentData[];
  is_visible_only_to_myself: boolean;
  _: null;
}

export interface IAuthorTag {
  border_color: string;
  border_night_color: string;
  color: string;
  has_border: boolean;
  night_color: string;
  text: string;
  type: string;
}

export interface DatumAuthor {
  id: string;
  url_token: string;
  name: string;
  avatar_url: string;
  avatar_url_template: string;
  is_org: boolean;
  type: UserTypeEnum;
  url: string;
  user_type: UserTypeEnum;
  headline: string;
  gender: number;
  is_advertiser: boolean;
  badge_v2: BadgeV2;
  exposed_medal: ExposedMedal;
  vip_info: PurpleVipInfo;
  level_info: null;
  is_anonymous: boolean;
}

export interface BadgeV2 {
  title: string;
  merged_badges: null;
  detail_badges: null;
}

export interface ExposedMedal {
  medal_id: string;
  medal_name: MedalName;
  avatar_url: string;
  description: string;
  medal_avatar_frame: string;
  can_click: boolean;
  mini_avatar_url?: string;
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
  is_vip: boolean;
  vip_icon?: VipIcon;
}

export interface VipIcon {
  url: string;
  night_mode_url: string;
}

export enum ResourceType {
  Answer = 'answer',
}

export enum ChildCommentType {
  Comment = 'comment',
}

export interface ICommentEditStatus {
  can_reply: boolean;
  toast: string;
}

export interface ICommentPaging {
  is_end: boolean;
  is_start: boolean;
  next: string;
  previous: string;
  totals: number;
}

export interface ICommentSorter {
  type: string;
  text: string;
}
