// Supabase データベース型定義

// phone_numbers テーブル
export interface PhoneNumberRow {
  id: number;
  number: string;
  country_code: string | null;
  area_code: string | null;
  exchange_code: string | null; // 旧: central_office
  subscriber_number: string | null;
  number_type: string | null;
  carrier_name: string | null;
  region: string | null;
  display_number: string | null;
  total_access_count: number;
  total_review_count: number;
  average_rating: number | null;
  last_access_at: string | null;
  last_review_at: string | null;
  created_at: string;
  updated_at: string;
}

// reviews テーブル
export interface ReviewRow {
  id: number;
  phone_number_id: number;
  call_source: string | null;
  call_purpose: string | null;
  body: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// events テーブル
export interface EventRow {
  id: number;
  event_type: string;
  keyword: string | null;
  phone_number_id: number | null;
  created_at: string;
}

// businesses テーブル
export interface BusinessRow {
  id: number;
  phone_number_id: number;
  name: string | null;
  industry: string | null;
  postal_code: string | null;
  address: string | null;
  contact_tel: string | null;
  nearest_station: string | null;
  access_info: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}
