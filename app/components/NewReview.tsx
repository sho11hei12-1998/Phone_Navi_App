import Link from "next/link";
import { createSupabaseClient } from "@/app/lib/supabaseClient";

type ReviewWithPhoneNumber = {
  id: number;
  body: string | null;
  created_at: string;
  phoneNumber: string;
  call_source: string | null;
  call_purpose: string | null;
};

export default async function NewReview() {
  const supabase = createSupabaseClient();

  // レビューを取得（リレーションを使って電話番号も一緒に取得を試みる）
  let { data, error } = await supabase
    .from("reviews")
    .select("id, body, created_at, phone_number_id, call_source, call_purpose, phone_numbers(number)")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .limit(10);

  let reviews: ReviewWithPhoneNumber[] = [];
  let displayError: { message: string } | null = null;

  if (error || !data) {
    // エラーが発生した場合、phone_number_idを使って直接電話番号を取得
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, body, created_at, phone_number_id, call_source, call_purpose")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(10);

    if (reviewsError || !reviewsData || reviewsData.length === 0) {
      displayError = { message: error?.message || reviewsError?.message || "データの取得に失敗しました" };
    } else {
      const phoneNumberIds = reviewsData.map(r => r.phone_number_id);
      const { data: phoneNumbersData, error: phoneNumbersError } = await supabase
        .from("phone_numbers")
        .select("id, number")
        .in("id", phoneNumberIds);

      if (phoneNumbersError) {
        displayError = { message: phoneNumbersError.message };
      } else {
        const phoneNumberMap = new Map(
          phoneNumbersData?.map(pn => [pn.id, pn.number]) || []
        );

        reviews = reviewsData.map(review => ({
          id: review.id,
          body: review.body,
          created_at: review.created_at,
          phoneNumber: phoneNumberMap.get(review.phone_number_id) || "不明",
          call_source: review.call_source,
          call_purpose: review.call_purpose,
        }));
      }
    }
  } else {
    // リレーションが成功した場合
    reviews = data.map(review => {
      // phone_numbersが配列の場合とオブジェクトの場合の両方に対応
      let phoneNumber = "不明";
      if (Array.isArray(review.phone_numbers) && review.phone_numbers.length > 0) {
        phoneNumber = review.phone_numbers[0].number;
      } else if (review.phone_numbers && typeof review.phone_numbers === 'object' && 'number' in review.phone_numbers) {
        phoneNumber = (review.phone_numbers as any).number;
      }

      return {
        id: review.id,
        body: review.body,
        created_at: review.created_at,
        phoneNumber: phoneNumber,
        call_source: review.call_source,
        call_purpose: review.call_purpose,
      };
    });
  }

  return (
    <section className="bg-white border border-gray-300 rounded-lg mb-4">
      {/* Header */}
      <div className="bg-green-50 border-b border-gray-200">
        <div className="px-4 py-2">
          <h2 className="text-sm font-bold text-gray-900">新着口コミ</h2>
        </div>
      </div>

      {/* Review List */}
      <div>
        {displayError && (
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm text-red-600">
              口コミの取得中にエラーが発生しました。
            </p>
            <p className="text-xs text-red-500 mt-1">{displayError.message}</p>
          </div>
        )}

        {!displayError && reviews.length === 0 && (
          <div className="px-4 py-3">
            <p className="text-sm text-gray-500">まだ口コミがありません。</p>
          </div>
        )}

        {reviews.map((review, index) => {
          // 日時を「YYYY/MM/DD HH:mm:ss」形式にフォーマット
          const formatDateTime = (dateString: string): string => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            const seconds = String(date.getSeconds()).padStart(2, "0");
            return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
          };
          const formattedDate = formatDateTime(review.created_at);

          const phoneNumber = review.phoneNumber;
          const comment = review.body || "コメントなし";
          
          // call_sourceとcall_purposeを表示用にフォーマット
          const formatCallInfo = (): string | null => {
            const source = review.call_source || "";
            const purpose = review.call_purpose || "";
            
            if (!source && !purpose) {
              return null;
            }
            
            if (source && purpose) {
              return `${source}／${purpose}`;
            } else if (source) {
              return source;
            } else {
              return purpose;
            }
          };
          
          const callInfo = formatCallInfo();

          return (
            <div
              key={review.id}
              className={`px-4 py-3 ${
                index !== reviews.length - 1 ? "border-b border-gray-200" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-1">
                    <Link
                      href={`/detail/${phoneNumber.replace(/[-\s]/g, "")}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                    >
                      {phoneNumber}
                    </Link>
                    <span className="text-xs text-gray-500 ml-2">
                      ({formattedDate})
                    </span>
                  </div>
                  {callInfo && (
                    <div className="mb-1">
                      <span className="text-xs text-gray-900">{callInfo}</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {comment}
                  </p>
                </div>
                <Link
                  href={`/detail/${phoneNumber.replace(/[-\s]/g, "")}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm whitespace-nowrap flex-shrink-0"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

