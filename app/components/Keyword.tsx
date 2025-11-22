import Link from "next/link";

export default function Keyword() {
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
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {[
              "居酒屋", "喫茶店", "スナック", "コンビニ", "ドラッグストア", "家電", "携帯電話", "百貨店",
              "スーパー", "ファッション", "スポーツ", "ホテル", "旅行", "病院", "薬局", "学校",
              "保育園", "不動産", "住宅", "郵便局", "自動車", "銀行", "弁護士", "美容"
            ].map((keyword, index) => (
              <Link
                key={index}
                href={`/?q=${encodeURIComponent(keyword)}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {keyword}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
