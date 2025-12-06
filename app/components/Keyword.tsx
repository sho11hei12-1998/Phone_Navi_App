import Link from "next/link";
import { getPopularKeywords, searchPhones } from "@/app/lib/supabase";

export default async function Keyword() {
  // 多めに取得してフィルタリング
  const allPopularKeywords = await getPopularKeywords(30);
  
  // 検索結果が1つ以上あるキーワードのみをフィルタリング
  const keywordResults = await Promise.all(
    allPopularKeywords.map(async (item) => {
      const results = await searchPhones(item.keyword);
      return { ...item, hasResults: results.length > 0 };
    })
  );
  
  // 2行分のキーワードを表示（約12-16個程度）
  const popularKeywords = keywordResults
    .filter(item => item.hasResults)
    .slice(0, 16);

  return (
    <section className="bg-white border border-gray-300 rounded-lg mb-4">
      {/* Popular Keywords Section */}
      <div className="bg-white">
        <div className="bg-green-50 border-b border-gray-200">
          <div className="px-4 py-2">
            <h2 className="text-sm font-bold text-gray-900">人気キーワード</h2>
          </div>
        </div>
        <div className="px-4 py-3">
          {popularKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm overflow-hidden" style={{ maxHeight: '3.5rem' }}>
              {popularKeywords.map((item, index) => (
                <Link
                  key={index}
                  href={`/search_detail?q=${encodeURIComponent(item.keyword)}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {item.keyword}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">キーワードがまだありません。</p>
          )}
        </div>
      </div>
    </section>
  );
}
