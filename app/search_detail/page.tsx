import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";
import { searchPhones, createEvent } from "@/app/lib/supabase";
import { createSupabaseClient } from "@/app/lib/supabaseClient";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

// 電話番号をフォーマット（ハイフンあり）
function formatPhoneNumber(number: string): string {
  // 既にハイフンが含まれている場合はそのまま返す
  if (number.includes("-")) {
    return number;
  }
  
  // 10桁または11桁の電話番号をフォーマット
  if (number.length === 10) {
    return `${number.slice(0, 2)}-${number.slice(2, 6)}-${number.slice(6)}`;
  } else if (number.length === 11) {
    return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`;
  }
  
  return number;
}

export default async function SearchDetailPage({ searchParams }: PageProps) {
  const { q: searchKeyword } = await searchParams;

  if (!searchKeyword) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-secondary">検索キーワードを入力してください。</p>
          </div>
        </div>
      </div>
    );
  }

  const results = await searchPhones(searchKeyword);

  // 検索イベントを作成
  await createEvent({
    event_type: "search",
    keyword: searchKeyword,
    phone_number_id: null,
  });

  // 口コミ数を取得
  const supabase = createSupabaseClient();
  const phoneIds = results.map(r => r.phone.id);
  const reviewCountsMap = new Map<number, number>();

  if (phoneIds.length > 0) {
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select("phone_number_id")
      .in("phone_number_id", phoneIds)
      .eq("is_deleted", false);

    if (reviewsData) {
      for (const review of reviewsData) {
        const currentCount = reviewCountsMap.get(review.phone_number_id) || 0;
        reviewCountsMap.set(review.phone_number_id, currentCount + 1);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 検索結果ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            「{searchKeyword}」の検索結果
          </h1>
          <p className="text-secondary">
            {results.length}件の結果が見つかりました
          </p>
        </div>

        {/* 検索結果リスト */}
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map(({ phone, business }) => {
              const formattedNumber = formatPhoneNumber(phone.number);
              const reviewCount = reviewCountsMap.get(phone.id) || 0;

              return (
                <div
                  key={phone.id}
                  className="bg-white border border-gray-300 rounded-lg overflow-hidden"
                >
                  {/* ヘッダー（オレンジ色のバナー） */}
                  <div className="bg-orange-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/detail/${phone.number.replace(/[-\s]/g, "")}?q=${encodeURIComponent(searchKeyword)}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        {phone.number}
                      </Link>
                      <span className="text-gray-500">/</span>
                      <Link
                        href={`/detail/${phone.number.replace(/[-\s]/g, "")}?q=${encodeURIComponent(searchKeyword)}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        {formattedNumber}
                      </Link>
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="px-4 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* 事業者名 */}
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          事業者名:
                        </span>
                        {business?.name ? (
                          <Link
                            href={`/detail/${phone.number.replace(/[-\s]/g, "")}?q=${encodeURIComponent(searchKeyword)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          >
                            {business.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-500">未登録</span>
                        )}
                      </div>

                      {/* 電話番号 */}
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          電話番号:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/detail/${phone.number.replace(/[-\s]/g, "")}?q=${encodeURIComponent(searchKeyword)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          >
                            {phone.number}
                          </Link>
                          <span className="text-gray-500">/</span>
                          <Link
                            href={`/detail/${phone.number.replace(/[-\s]/g, "")}?q=${encodeURIComponent(searchKeyword)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                          >
                            {formattedNumber}
                          </Link>
                        </div>
                      </div>

                      {/* 口コミ数 */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          口コミ数
                        </span>
                        <span className="text-sm text-orange-600 font-medium">
                          {reviewCount}件
                        </span>
                      </div>
                    </div>

                    {/* 詳細を見るリンク */}
                    <div className="flex-shrink-0">
                      <Link
                        href={`/detail/${phone.number.replace(/[-\s]/g, "")}?q=${encodeURIComponent(searchKeyword)}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm whitespace-nowrap"
                      >
                        詳細を見る
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-secondary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              検索結果が見つかりませんでした
            </h2>
            <p className="text-secondary mb-6">
              「{searchKeyword}」に一致する情報は見つかりませんでした。
            </p>
            <p className="text-sm text-secondary">
              別のキーワードで検索してみてください。
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-foreground text-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; 2025 電話番号ナビ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

