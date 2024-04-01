export interface IZhihuAnswerResponse {
  data: IZhihuAnswerDataItem[];
  session: IZhihuAnswerSession;
  paging: IZhihuPaging;
}

export interface IZhihuAnswerDataItem {
  type: string;
  target_type: string;
  target: Target;
  skip_count: boolean;
  position: number;
  cursor: string;
  is_jump_native: boolean;
}

export interface Target {
  admin_closed_comment: boolean;
  annotation_action: null;
  answer_type: string;
  attached_info: string;
  author: Author;
  can_comment: CanComment;
  collapse_reason: string;
  collapsed_by: string;
  comment_count: number;
  comment_permission: string;
  content: string;
  content_mark: ContentMark;
  created_time: number;
  decorative_labels: any[];
  editable_content: string;
  excerpt: string;
  extras: string;
  id: number;
  is_collapsed: boolean;
  is_copyable: boolean;
  is_jump_native: boolean;
  is_labeled: boolean;
  is_mine: boolean;
  is_normal: boolean;
  is_sticky: boolean;
  is_visible: boolean;
  question: Question;
  reaction_instruction: ContentMark;
  relationship: Relationship;
  relevant_info: RelevantInfo;
  reshipment_settings: string;
  reward_info: RewardInfo;
  sticky_info: string;
  suggest_edit: SuggestEdit;
  thanks_count: number;
  thumbnail_info: ThumbnailInfo;
  type: string;
  updated_time: number;
  url: string;
  visible_only_to_author: boolean;
  voteup_count: number;
  zhi_plus_extra_info: string;
  label_info: ILabelInfo;
}

export interface ILabelInfo {
  foreground_color: ForegroundColor;
  icon_url: string;
  text: string;
  type: string;
}

export interface ForegroundColor {
  alpha: number;
  group: string;
}

export interface Author {
  avatar_url: string;
  avatar_url_template: string;
  badge: any[];
  badge_v2: BadgeV2;
  exposed_medal: ExposedMedal;
  follower_count: number;
  gender: number;
  headline: string;
  id: string;
  is_advertiser: boolean;
  is_followed: boolean;
  is_following: boolean;
  is_org: boolean;
  is_privacy: boolean;
  name: string;
  type: string;
  url: string;
  url_token: string;
  user_type: string;
}

export interface BadgeV2 {
  detail_badges: any[];
  icon: string;
  merged_badges: any[];
  night_icon: string;
  title: string;
}

export interface ExposedMedal {
  avatar_url: string;
  description: string;
  medal_id: string;
  medal_name: string;
  medal_avatar_frame?: string;
  mini_avatar_url?: string;
}

export interface CanComment {
  reason: string;
  status: boolean;
}

export interface ContentMark {}

export interface Question {
  created: number;
  id: number;
  question_type: string;
  relationship: ContentMark;
  title: string;
  type: string;
  updated_time: number;
  url: string;
}

export interface Relationship {
  is_author: boolean;
  is_authorized: boolean;
  is_nothelp: boolean;
  is_thanked: boolean;
  upvoted_followees: any[];
  voting: number;
}

export interface RelevantInfo {
  is_relevant: boolean;
  relevant_text: string;
  relevant_type: string;
}

export interface RewardInfo {
  can_open_reward: boolean;
  is_rewardable: boolean;
  reward_member_count: number;
  reward_total_money: number;
  tagline: string;
}

export interface SuggestEdit {
  reason: string;
  status: boolean;
  tip: string;
  title: string;
  unnormal_details: UnnormalDetails;
  url: string;
}

export interface UnnormalDetails {
  description: string;
  note: string;
  reason: string;
  reason_id: number;
  status: string;
}

export interface ThumbnailInfo {
  count: number;
  thumbnails: any[];
  type: string;
}

export interface IZhihuPaging {
  page: number;
  is_end: boolean;
  next: string;
}

export interface IZhihuAnswerSession {
  id: string;
}
