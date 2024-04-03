export interface IZhihuListRecommendResponse {
  data: IZhihuRecommendData[];
  paging: IZhihuRecommendPaging;
  freshText: string;
}

export interface IZhihuRecommendData {
  id: string;
  type: string;
  offset: number;
  verb: string;
  createdTime: number;
  updatedTime: number;
  target: IZhihuRecommendDataTarget;
  brief: string;
  attachedInfo: string;
  actionCard: boolean;
}

export interface IZhihuRecommendDataTarget {
  id: number;
  type: string;
  url: string;
  author: Author;
  createdTime: number;
  updatedTime: number;
  voteupCount: number;
  thanksCount: number;
  commentCount: number;
  isCopyable: boolean;
  question: Question;
  excerpt: string;
  excerptNew: string;
  previewType: string;
  previewText: string;
  reshipmentSettings: string;
  content: string;
  relationship: TargetRelationship;
  isLabeled: boolean;
  visitedCount: number;
  favoriteCount: number;
  answerType: string;
  title?: string;
}

export interface Author {
  id: string;
  url: string;
  userType: UserType;
  urlToken: string;
  name: string;
  headline: string;
  avatarUrl: string;
  isOrg: boolean;
  gender: number;
  followersCount: number;
  isFollowing: boolean;
  isFollowed: boolean;
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
  answerCount: number;
  followerCount: number;
  commentCount: number;
  boundTopicIds: number[];
  isFollowing: boolean;
  excerpt: string;
  relationship: QuestionRelationship;
  detail: string;
  questionType: string;
}

export interface QuestionRelationship {
  isAuthor: boolean;
}

export interface TargetRelationship {
  isThanked: boolean;
  isNothelp: boolean;
  voting: number;
}

export interface IZhihuRecommendPaging {
  isEnd: boolean;
  isStart: boolean;
  next: string;
  previous: string;
  totals: number;
}
