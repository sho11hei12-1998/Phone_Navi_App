export type CallType = "spam" | "sales" | "legitimate" | "unknown" | "scam";

export interface PhoneNumber {
  id: string;
  number: string;
  formattedNumber: string;
  area: string;
  carrier?: string;
  callType: CallType;
  totalReviews: number;
  totalViews: number;
  dangerLevel: number; // 1-5
  lastUpdated: string;
  // 事業者詳細情報
  companyName?: string; // 事業者名称
  industry?: string; // 業種
  address?: string; // 住所
  contact?: string; // 問い合わせ先
  nearestStation?: string; // 最寄り駅
  access?: string; // アクセス
  website?: string; // 公式サイト
}

export interface Review {
  id: string;
  phoneNumberId: string;
  callType: CallType;
  comment: string;
  callerName?: string;
  createdAt: string;
  helpful: number;
  notHelpful: number;
}
