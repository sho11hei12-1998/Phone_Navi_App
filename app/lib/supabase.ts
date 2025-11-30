import { createSupabaseClient } from "./supabaseClient";
import type { PhoneNumberRow, ReviewRow, BusinessRow } from "./database.types";
import type { PhoneNumber, Review } from "./types";

// PhoneNumberRow を PhoneNumber 型に変換
function convertPhoneNumberRowToPhoneNumber(row: PhoneNumberRow): PhoneNumber {
  // 番号の整形（ハイフンなし → ハイフンあり）
  const number = row.number;
  let formattedNumber = row.display_number || number;

  // dangerLevelの計算（仮実装：レーティングから算出）
  let dangerLevel = 3; // デフォルト
  if (row.average_rating !== null) {
    if (row.average_rating <= 1.5) dangerLevel = 5;
    else if (row.average_rating <= 2.5) dangerLevel = 4;
    else if (row.average_rating <= 3.5) dangerLevel = 3;
    else if (row.average_rating <= 4.0) dangerLevel = 2;
    else dangerLevel = 1;
  }

  // callTypeの推定（仮実装：デフォルト）
  let callType: "spam" | "sales" | "legitimate" | "unknown" | "scam" = "unknown";

  return {
    id: row.id.toString(),
    number: row.number,
    formattedNumber: formattedNumber,
    area: row.region || "-",
    carrier: row.carrier_name || undefined,
    callType: callType,
    totalReviews: row.total_review_count,
    totalViews: row.total_access_count,
    dangerLevel: dangerLevel,
    lastUpdated: row.last_review_at || row.updated_at,
    // business情報は別途取得するため、ここでは設定しない
  };
}

// ReviewRow を Review 型に変換
function convertReviewRowToReview(row: ReviewRow & { phone_numbers?: PhoneNumberRow }): Review {
  // callTypeの推定（仮実装：call_purposeから判断）
  let callType: "spam" | "sales" | "legitimate" | "unknown" | "scam" = "unknown";
  if (row.call_purpose?.includes("spam") || row.call_purpose?.includes("迷惑")) {
    callType = "spam";
  } else if (row.call_purpose?.includes("営業") || row.call_purpose?.includes("勧誘")) {
    callType = "sales";
  } else if (row.call_purpose?.includes("詐欺")) {
    callType = "scam";
  } else if (row.call_purpose?.includes("正当")) {
    callType = "legitimate";
  }

  return {
    id: row.id.toString(),
    phoneNumberId: row.phone_number_id.toString(),
    callType: callType,
    comment: row.body || "",
    callerName: row.call_source || undefined,
    createdAt: row.created_at,
    helpful: 0, // MVPでは未実装
    notHelpful: 0, // MVPでは未実装
  };
}

// 電話番号で検索（PhoneNumber型を返す）
export async function getPhoneByNumber(number: string): Promise<PhoneNumber | null> {
  const supabase = createSupabaseClient();
  const cleanNumber = number.replace(/[-\s]/g, "");

  const { data, error } = await supabase
    .from("phone_numbers")
    .select("*")
    .eq("number", cleanNumber)
    .single();

  if (error || !data) {
    return null;
  }

  return convertPhoneNumberRowToPhoneNumber(data);
}

// 電話番号で検索（PhoneNumberRowを直接返す）
export async function getPhoneRowByNumber(number: string): Promise<PhoneNumberRow | null> {
  const supabase = createSupabaseClient();
  const cleanNumber = number.replace(/[-\s]/g, "");

  const { data, error } = await supabase
    .from("phone_numbers")
    .select("*")
    .eq("number", cleanNumber)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// 電話番号IDで事業者情報を取得
export async function getBusinessByPhoneNumberId(phoneNumberId: number): Promise<BusinessRow | null> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("phone_number_id", phoneNumberId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// 電話番号で検索（PhoneNumberRowとBusinessRowの両方を返す）
export async function getPhoneWithBusiness(number: string): Promise<{
  phone: PhoneNumberRow;
  business: BusinessRow | null;
} | null> {
  const phone = await getPhoneRowByNumber(number);
  if (!phone) {
    return null;
  }

  const business = await getBusinessByPhoneNumberId(phone.id);
  return { phone, business };
}

// 電話番号IDで口コミを取得
export async function getReviewsByPhoneId(phoneNumberId: string): Promise<Review[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("phone_number_id", parseInt(phoneNumberId))
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(convertReviewRowToReview);
}

// 最近更新された電話番号を取得
export async function getRecentPhoneNumbers(limit: number = 6): Promise<PhoneNumber[]> {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("phone_numbers")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(convertPhoneNumberRowToPhoneNumber);
}

// 週間アクセスランキング（上位10件）- 直近7日間のeventsテーブルから集計
export async function getWeeklyAccessRanking(limit: number = 10) {
  const supabase = createSupabaseClient();

  // 直近7日間の日付を計算
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // 直近7日間のdetail_viewとsearchイベントを取得
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("phone_number_id")
    .in("event_type", ["detail_view", "search"])
    .gte("created_at", sevenDaysAgoISO)
    .not("phone_number_id", "is", null);

  if (eventsError || !eventsData) {
    return [];
  }

  // phone_number_idごとにカウント
  const countMap = new Map<number, number>();
  eventsData.forEach((event) => {
    if (event.phone_number_id) {
      const currentCount = countMap.get(event.phone_number_id) || 0;
      countMap.set(event.phone_number_id, currentCount + 1);
    }
  });

  // カウント順にソートして上位limit件を取得
  const sortedEntries = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sortedEntries.length === 0) {
    return [];
  }

  // phone_number_idのリストを取得
  const phoneNumberIds = sortedEntries.map(([id]) => id);

  // phone_numbersを取得
  const { data: phonesData, error: phonesError } = await supabase
    .from("phone_numbers")
    .select("id, number")
    .in("id", phoneNumberIds);

  if (phonesError || !phonesData) {
    return [];
  }

  // businessesテーブルから事業者情報を取得
  const phoneIds = phonesData.map((p) => p.id);
  const { data: businessesData } = await supabase
    .from("businesses")
    .select("phone_number_id, name")
    .in("phone_number_id", phoneIds);

  // 電話番号IDをキーにしたマップを作成
  const businessMap = new Map(
    (businessesData || []).map((business) => [business.phone_number_id, business.name])
  );

  const phoneMap = new Map(
    phonesData.map((phone) => [
      phone.id,
      {
        number: phone.number,
        businessName: businessMap.get(phone.id) || null,
      },
    ])
  );

  // ランキングデータを作成
  const ranking = sortedEntries.map(([phoneNumberId, count], index) => {
    const phoneData = phoneMap.get(phoneNumberId);
    return {
      rank: index + 1,
      name: phoneData?.businessName || phoneData?.number || "不明",
      count: count,
      phoneNumber: phoneData?.number || null,
    };
  });

  return ranking;
}

// 週間口コミランキング（上位10件）- 直近7日間のeventsテーブルから集計
export async function getWeeklyReviewRanking(limit: number = 10) {
  const supabase = createSupabaseClient();

  // 直近7日間の日付を計算
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoISO = sevenDaysAgo.toISOString();

  // 直近7日間のreview_createイベントを取得
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("phone_number_id")
    .eq("event_type", "review_create")
    .gte("created_at", sevenDaysAgoISO)
    .not("phone_number_id", "is", null);

  if (eventsError || !eventsData) {
    return [];
  }

  // phone_number_idごとにカウント
  const countMap = new Map<number, number>();
  eventsData.forEach((event) => {
    if (event.phone_number_id) {
      const currentCount = countMap.get(event.phone_number_id) || 0;
      countMap.set(event.phone_number_id, currentCount + 1);
    }
  });

  // カウント順にソートして上位limit件を取得
  const sortedEntries = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (sortedEntries.length === 0) {
    return [];
  }

  // phone_number_idのリストを取得
  const phoneNumberIds = sortedEntries.map(([id]) => id);

  // phone_numbersを取得
  const { data: phonesData, error: phonesError } = await supabase
    .from("phone_numbers")
    .select("id, number")
    .in("id", phoneNumberIds);

  if (phonesError || !phonesData) {
    return [];
  }

  // businessesテーブルから事業者情報を取得
  const phoneIds = phonesData.map((p) => p.id);
  const { data: businessesData } = await supabase
    .from("businesses")
    .select("phone_number_id, name")
    .in("phone_number_id", phoneIds);

  // 電話番号IDをキーにしたマップを作成
  const businessMap = new Map(
    (businessesData || []).map((business) => [business.phone_number_id, business.name])
  );

  const phoneMap = new Map(
    phonesData.map((phone) => [
      phone.id,
      {
        number: phone.number,
        businessName: businessMap.get(phone.id) || null,
      },
    ])
  );

  // ランキングデータを作成
  const ranking = sortedEntries.map(([phoneNumberId, count], index) => {
    const phoneData = phoneMap.get(phoneNumberId);
    return {
      rank: index + 1,
      name: phoneData?.businessName || phoneData?.number || "不明",
      count: count,
      phoneNumber: phoneData?.number || null,
    };
  });

  return ranking;
}

// 人気キーワードを取得（searchイベントのkeywordを集計）
export async function getPopularKeywords(limit: number = 24): Promise<{ keyword: string; count: number }[]> {
  const supabase = createSupabaseClient();

  // searchイベントでkeywordがnullでないものを取得
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("keyword")
    .eq("event_type", "search")
    .not("keyword", "is", null);

  if (eventsError || !eventsData) {
    return [];
  }

  // keywordごとにカウント
  const countMap = new Map<string, number>();
  eventsData.forEach((event) => {
    if (event.keyword && event.keyword.trim() !== "") {
      const keyword = event.keyword.trim();
      const currentCount = countMap.get(keyword) || 0;
      countMap.set(keyword, currentCount + 1);
    }
  });

  // カウント順にソートして上位limit件を取得
  const sortedEntries = Array.from(countMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  // キーワードとカウントの配列を返す
  return sortedEntries.map(([keyword, count]) => ({
    keyword,
    count,
  }));
}

// 最新のキーワードを取得（searchイベントのkeywordを新しい順に取得）
export async function getLatestKeywords(limit: number = 20): Promise<string[]> {
  const supabase = createSupabaseClient();

  // searchイベントでkeywordがnullでないものを新しい順に取得
  const { data: eventsData, error: eventsError } = await supabase
    .from("events")
    .select("keyword, created_at")
    .eq("event_type", "search")
    .not("keyword", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit * 3); // 重複を除外するため多めに取得

  if (eventsError || !eventsData) {
    return [];
  }

  // キーワードを新しい順に取得（重複を除外）
  const seenKeywords = new Set<string>();
  const uniqueKeywords: string[] = [];

  for (const event of eventsData) {
    if (event.keyword && event.keyword.trim() !== "") {
      const keyword = event.keyword.trim();
      if (!seenKeywords.has(keyword)) {
        seenKeywords.add(keyword);
        uniqueKeywords.push(keyword);
        if (uniqueKeywords.length >= limit) {
          break;
        }
      }
    }
  }

  return uniqueKeywords;
}

// イベントを作成
export async function createEvent(data: {
  event_type: "search" | "detail_view" | "review_create";
  keyword?: string | null;
  phone_number_id?: number | null;
}): Promise<void> {
  const supabase = createSupabaseClient();

  await supabase.from("events").insert({
    event_type: data.event_type,
    keyword: data.keyword || null,
    phone_number_id: data.phone_number_id || null,
  });
}

// アクセス数を更新
export async function incrementAccessCount(phoneNumberId: number): Promise<void> {
  const supabase = createSupabaseClient();

  // 現在のアクセス数を取得
  const { data: phoneData } = await supabase
    .from("phone_numbers")
    .select("total_access_count")
    .eq("id", phoneNumberId)
    .single();

  if (phoneData) {
    // アクセス数をインクリメントして更新
    await supabase
      .from("phone_numbers")
      .update({
        total_access_count: (phoneData.total_access_count || 0) + 1,
        last_access_at: new Date().toISOString(),
      })
      .eq("id", phoneNumberId);
  }
}

// キーワードで検索（電話番号、事業者名、住所など）
export async function searchPhones(keyword: string): Promise<Array<{
  phone: PhoneNumberRow;
  business: BusinessRow | null;
}>> {
  const supabase = createSupabaseClient();
  const cleanKeyword = keyword.trim();

  if (!cleanKeyword) {
    return [];
  }

  // 電話番号として検索（ハイフンやスペースを除去）
  const cleanNumber = cleanKeyword.replace(/[-\s]/g, "");
  
  // 数字のみかどうかを判定（電話番号として検索するかどうか）
  const isNumericOnly = /^\d+$/.test(cleanNumber);

  // 結果をマージするためのMap
  const resultMap = new Map<number, { phone: PhoneNumberRow; business: BusinessRow | null }>();

  // 電話番号で検索（数字のみの場合、または数字が含まれている場合）
  if (isNumericOnly || cleanNumber.length >= 3) {
    // 電話番号で検索
    const { data: phonesByNumber, error: phoneError } = await supabase
      .from("phone_numbers")
      .select("*")
      .or(`number.ilike.%${cleanNumber}%,display_number.ilike.%${cleanKeyword}%`);

    if (!phoneError && phonesByNumber) {
      for (const phone of phonesByNumber) {
        if (!resultMap.has(phone.id)) {
          resultMap.set(phone.id, { phone, business: null });
        }
      }

      // 電話番号で見つかったものに対して事業者情報を取得
      if (phonesByNumber.length > 0) {
        const phoneIds = phonesByNumber.map(p => p.id);
        const { data: businessesForPhones } = await supabase
          .from("businesses")
          .select("*")
          .in("phone_number_id", phoneIds);

        if (businessesForPhones) {
          for (const business of businessesForPhones) {
            if (resultMap.has(business.phone_number_id)) {
              resultMap.get(business.phone_number_id)!.business = business;
            }
          }
        }
      }
    }
  }

  // 事業者名、住所、業種で検索（個別に検索して結果をマージ）
  const businessSearchQueries = [
    supabase.from("businesses").select("*").ilike("name", `%${cleanKeyword}%`),
    supabase.from("businesses").select("*").ilike("address", `%${cleanKeyword}%`),
    supabase.from("businesses").select("*").ilike("industry", `%${cleanKeyword}%`),
  ];

  const businessResults = await Promise.all(businessSearchQueries);
  const businessSet = new Set<number>(); // 重複を避けるため
  const allBusinesses: BusinessRow[] = [];

  for (const result of businessResults) {
    if (!result.error && result.data) {
      for (const business of result.data) {
        if (!businessSet.has(business.id)) {
          businessSet.add(business.id);
          allBusinesses.push(business);
        }
      }
    }
  }

  if (allBusinesses.length > 0) {
    // 事業者情報からphone_number_idを取得
    const phoneNumberIds = allBusinesses.map(b => b.phone_number_id).filter((id): id is number => id !== null);
    
    if (phoneNumberIds.length > 0) {
      // phone_number_idを使って電話番号を取得
      const { data: phonesForBusinesses, error: phonesError } = await supabase
        .from("phone_numbers")
        .select("*")
        .in("id", phoneNumberIds);

      if (!phonesError && phonesForBusinesses) {
        // 電話番号と事業者情報をマッピング
        const businessMap = new Map<number, BusinessRow>();
        for (const business of allBusinesses) {
          businessMap.set(business.phone_number_id, business);
        }

        for (const phone of phonesForBusinesses) {
          const business = businessMap.get(phone.id);
          if (resultMap.has(phone.id)) {
            // 既に存在する場合は事業者情報を追加（より詳細な情報があれば更新）
            if (business) {
              resultMap.get(phone.id)!.business = business;
            }
          } else {
            // 新規追加
            resultMap.set(phone.id, { phone, business: business || null });
          }
        }
      }
    }
  }

  return Array.from(resultMap.values());
}

// 口コミを作成
export async function createReview(data: {
  phone_number_id: number;
  call_source: string | null;
  call_purpose: string | null;
  body: string | null;
  rating: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseClient();

  try {
    // reviewsテーブルにレコードを作成
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        phone_number_id: data.phone_number_id,
        call_source: data.call_source || null,
        call_purpose: data.call_purpose || null,
        body: data.body || null,
        rating: data.rating,
        is_deleted: false,
      })
      .select()
      .single();

    if (reviewError || !review) {
      return { success: false, error: reviewError?.message || "口コミの作成に失敗しました" };
    }

    // phone_numbersテーブルのtotal_review_countとaverage_ratingを更新
    // 削除されていないすべての口コミの評価を取得
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("rating")
      .eq("phone_number_id", data.phone_number_id)
      .eq("is_deleted", false);

    if (!reviewsError && reviewsData) {
      // 評価がnullでないものをフィルタリング
      const validRatings = reviewsData
        .map((r) => r.rating)
        .filter((rating): rating is number => rating !== null && rating !== undefined);

      // 平均評価を計算
      const averageRating =
        validRatings.length > 0
          ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length
          : null;

      // 平均評価を小数点第1位まで丸める
      const roundedAverage = averageRating ? Math.round(averageRating * 10) / 10 : null;

      // phone_numbersテーブルを更新
      await supabase
        .from("phone_numbers")
        .update({
          total_review_count: validRatings.length,
          average_rating: roundedAverage,
          last_review_at: new Date().toISOString(),
        })
        .eq("id", data.phone_number_id);
    }

    // eventsテーブルにレコードを作成
    try {
      await createEvent({
        event_type: "review_create",
        keyword: null,
        phone_number_id: data.phone_number_id,
      });
    } catch (eventError) {
      // イベント作成失敗はログに記録するが、口コミ作成自体は成功とする
      console.error("イベント作成エラー:", eventError);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "口コミの作成に失敗しました" };
  }
}
