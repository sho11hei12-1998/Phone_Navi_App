import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import ReviewCard from "@/app/components/ReviewCard";
import ReviewForm from "@/app/components/ReviewForm";
import BusinessInfoCard from "@/app/components/BusinessInfoCard";
import { getPhoneWithBusiness, getReviewsByPhoneId, createEvent, incrementAccessCount } from "@/app/lib/supabase";
import { createSupabaseClient } from "@/app/lib/supabaseClient";

interface PageProps {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ q?: string }>;
}

export default async function PhoneDetailPage({ params, searchParams }: PageProps) {
  const { number } = await params;
  const { q: searchKeyword } = await searchParams;
  const result = await getPhoneWithBusiness(number);

  // イベントを作成とアクセス数を更新
  if (result) {
    // 電話番号が見つかった場合
    // アクセス数を更新
    await incrementAccessCount(result.phone.id);

    // イベントを作成
    if (searchKeyword) {
      // 検索からの遷移
      await createEvent({
        event_type: "search",
        keyword: searchKeyword,
        phone_number_id: result.phone.id,
      });
    } else {
      // 通常の遷移（詳細閲覧）
      await createEvent({
        event_type: "detail_view",
        keyword: null,
        phone_number_id: result.phone.id,
      });
    }
  } else if (searchKeyword) {
    // 電話番号が見つからなかったが、検索キーワードがある場合
    await createEvent({
      event_type: "search",
      keyword: searchKeyword,
      phone_number_id: null,
    });
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {number}
            </h1>
            <p className="text-gray-600 mb-6">
              この電話番号の情報はまだ登録されていません。
            </p>
            <p className="text-sm text-gray-500">
              情報をお持ちの方は、下記フォームから口コミを投稿してください。
            </p>
          </div>
          <div id="review-form" className="mt-8">
            <ReviewForm phoneNumber={number} />
          </div>
        </div>
      </div>
    );
  }

  const { phone, business } = result;
  const reviews = await getReviewsByPhoneId(phone.id.toString());

  // number_typeを日本語に変換する関数
  const getNumberTypeLabel = (numberType: string | null): string => {
    if (!numberType) return "-";
    const typeMap: { [key: string]: string } = {
      "fixed": "固定電話",
      "mobile": "携帯電話/PHS",
      "toll_free": "フリーダイヤル",
      "ip": "IP電話",
    };
    return typeMap[numberType] || numberType;
  };

  // 表示用の電話番号（display_numberがあればそれを使用、なければnumberを使用）
  const displayNumber = phone.display_number || phone.number;
  
  // 検索回数を取得（eventsテーブルから集計）
  const supabase = createSupabaseClient();
  const { data: searchEvents } = await supabase
    .from("events")
    .select("id")
    .eq("event_type", "search")
    .eq("phone_number_id", phone.id);
  
  const searchCount = searchEvents?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Phone Info Card */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {displayNumber}の基本情報
            </h3>
            <a
              href="#review-form"
              className="bg-white text-green-600 rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              口コミを投稿する
            </a>
          </div>

          <table className="w-full">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium w-1/3 bg-green-50">頭番号</td>
                <td className="py-3 px-4 text-gray-900">{phone.area_code || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">中間番号</td>
                <td className="py-3 px-4 text-gray-900">{phone.exchange_code || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">加入者番号</td>
                <td className="py-3 px-4 text-gray-900">{phone.subscriber_number || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">アクセス回数</td>
                <td className="py-3 px-4 text-gray-900 flex items-center gap-2">
                  {phone.total_access_count}回
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">検索回数</td>
                <td className="py-3 px-4 text-gray-900 flex items-center gap-2">
                  {searchCount}回
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">口コミ件数</td>
                <td className="py-3 px-4 text-gray-900">{phone.total_review_count}件</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">番号種類</td>
                <td className="py-3 px-4 text-gray-900 flex items-center gap-2">
                  {getNumberTypeLabel(phone.number_type)}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">番号提供事業者</td>
                <td className="py-3 px-4 text-gray-900">{phone.carrier_name || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">地域</td>
                <td className="py-3 px-4 text-gray-900">{phone.region || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Business Info Card */}
        <BusinessInfoCard
          displayNumber={displayNumber}
          business={business}
          phoneNumberId={phone.id}
          phoneNumber={phone.number}
        />



        {/* Reviews List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">
              口コミ一覧 ({reviews.length}件)
            </h2>
            <a
              href="#review-form"
              className="bg-white border-2 border-green-600 text-green-600 rounded-lg px-4 py-3 text-sm font-medium hover:bg-green-50 transition-colors whitespace-nowrap"
            >
              口コミを投稿する
            </a>
          </div>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-600">
                まだ口コミがありません。<br />
                最初の投稿者になりましょう。
              </p>
            </div>
          )}
        </div>

        {/* Review Form */}
        <div id="review-form">
          <ReviewForm phoneNumber={phone.number.replace(/[-\s]/g, "")} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-foreground text-white py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; 2025 電話番号ナビ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}


