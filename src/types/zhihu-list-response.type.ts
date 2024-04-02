export interface IZhihuListRecommendResponse {
  data: IZhihuRecommendData[];
  paging: IZhihuRecommendPaging;
  fresh_text: string;
}

export interface IZhihuRecommendData {
  id: string;
  type: string;
  offset: number;
  verb: string;
  created_time: number;
  updated_time: number;
  target: Target;
  brief: string;
  attached_info: string;
  action_card: boolean;
}

export interface Target {
  id: number;
  type: string;
  url: string;
  author: Author;
  created_time: number;
  updated_time: number;
  voteup_count: number;
  thanks_count: number;
  comment_count: number;
  is_copyable: boolean;
  question: Question;
  excerpt: string;
  excerpt_new: string;
  preview_type: string;
  preview_text: string;
  reshipment_settings: string;
  content: string;
  relationship: TargetRelationship;
  is_labeled: boolean;
  visited_count: number;
  favorite_count: number;
  answer_type: string;
}

export interface Author {
  id: string;
  url: string;
  user_type: UserType;
  url_token: string;
  name: string;
  headline: string;
  avatar_url: string;
  is_org: boolean;
  gender: number;
  followers_count: number;
  is_following: boolean;
  is_followed: boolean;
  badge?: Badge[];
}

export interface Badge {
  type: string;
  description: string;
}

export enum UserType {
  People = 'people',
}

export interface Question {
  id: number;
  type: string;
  url: string;
  author: Author;
  title: string;
  created: number;
  answer_count: number;
  follower_count: number;
  comment_count: number;
  bound_topic_ids: number[];
  is_following: boolean;
  excerpt: string;
  relationship: QuestionRelationship;
  detail: string;
  question_type: string;
}

export interface QuestionRelationship {
  is_author: boolean;
}

export interface TargetRelationship {
  is_thanked: boolean;
  is_nothelp: boolean;
  voting: number;
}

export interface IZhihuRecommendPaging {
  is_end: boolean;
  is_start: boolean;
  next: string;
  previous: string;
  totals: number;
}
