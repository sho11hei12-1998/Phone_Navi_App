import { notFound } from "next/navigation";
import Header from "@/app/components/Header";
import ReviewCard from "@/app/components/ReviewCard";
import ReviewForm from "@/app/components/ReviewForm";
import { getPhoneByNumber, getReviewsByPhoneId } from "@/app/lib/mockData";

interface PageProps {
  params: Promise<{ number: string }>;
}

export default async function PhoneDetailPage({ params }: PageProps) {
  const { number } = await params;
  const phone = getPhoneByNumber(number);

  if (!phone) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-secondary">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {number}
            </h1>
            <p className="text-secondary mb-6">
              この電話番号の情報はまだ登録されていません。
            </p>
            <p className="text-sm text-secondary">
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

  const reviews = getReviewsByPhoneId(phone.id);

  // 電話番号を分解
  const cleanNumber = phone.number.replace(/[-\s]/g, "");
  let areaCode = "";
  let localExchange = "";
  let subscriberNumber = "";
  
  if (cleanNumber.startsWith("090") || cleanNumber.startsWith("080") || cleanNumber.startsWith("070")) {
    // 携帯電話: 090-1234-5678 → 090, 1234, 5678
    areaCode = cleanNumber.slice(0, 3);
    localExchange = cleanNumber.slice(3, 7);
    subscriberNumber = cleanNumber.slice(7, 11);
  } else if (cleanNumber.startsWith("0120") || cleanNumber.startsWith("0800") || cleanNumber.startsWith("0570")) {
    // フリーダイヤル: 0120-123-456 → 0120, 123, 456
    areaCode = cleanNumber.slice(0, 4);
    localExchange = cleanNumber.slice(4, 7);
    subscriberNumber = cleanNumber.slice(7);
  } else if (cleanNumber.length === 10) {
    // 固定電話: 03-1234-5678 → 03, 1234, 5678
    areaCode = cleanNumber.slice(0, 2);
    localExchange = cleanNumber.slice(2, 6);
    subscriberNumber = cleanNumber.slice(6);
  } else if (cleanNumber.length === 11) {
    // 固定電話: 052-765-4321 → 052, 765, 4321
    areaCode = cleanNumber.slice(0, 3);
    localExchange = cleanNumber.slice(3, 6);
    subscriberNumber = cleanNumber.slice(6);
  }

  // 回線種別を判定
  const lineType = phone.area.includes("携帯") || cleanNumber.startsWith("090") || cleanNumber.startsWith("080") || cleanNumber.startsWith("070")
    ? "携帯電話/PHS"
    : phone.area.includes("フリーダイヤル")
    ? "フリーダイヤル"
    : "固定電話";

  // 検索結果表示回数を判定
  const searchDisplayCount = phone.totalViews < 10 ? "10回未満" : `${phone.totalViews}回`;

  return (
    <div className="min-h-screen bg-background">
      <Header />


      

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Phone Info Card */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3">
            <h3 className="text-sm font-bold text-white">
              {phone.formattedNumber}の基本情報
            </h3>
          </div>

          <table className="w-full">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium w-1/3 bg-green-50">頭番号</td>
                <td className="py-3 px-4 text-gray-900">{areaCode || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">中間番号</td>
                <td className="py-3 px-4 text-gray-900">{localExchange || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">加入者番号</td>
                <td className="py-3 px-4 text-gray-900">{subscriberNumber || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">アクセス回数</td>
                <td className="py-3 px-4 text-gray-900 flex items-center gap-2">

                  {phone.totalViews}回
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">検索回数</td>
                <td className="py-3 px-4 text-gray-900 flex items-center gap-2">
                  {searchDisplayCount}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">口コミ件数</td>
                <td className="py-3 px-4 text-gray-900">{phone.totalReviews}件</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">番号種類</td>
                <td className="py-3 px-4 text-gray-900 flex items-center gap-2">
                  {lineType}
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">番号提供事業者</td>
                <td className="py-3 px-4 text-gray-900">{phone.carrier || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">地域</td>
                <td className="py-3 px-4 text-gray-900">{phone.area}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">事業者</td>
                <td className="py-3 px-4 text-gray-900">{phone.formattedNumber}</td>
              </tr>
            </tbody>
          </table>
        </div>

                {/* Phone Info Card */}
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {phone.formattedNumber}の事業者詳細情報
            </h3>
            <button className="bg-white text-green-600 rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
              事業者情報更新
            </button>
          </div>

          <table className="w-full">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium w-1/3 bg-green-50">事業者名称</td>
                <td className="py-3 px-4 text-gray-900">{phone.companyName || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">業種</td>
                <td className="py-3 px-4 text-gray-900">{phone.industry || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">住所</td>
                <td className="py-3 px-4 text-gray-900">{phone.address || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">問い合わせ先</td>
                <td className="py-3 px-4 text-gray-900">{phone.contact || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">最寄り駅</td>
                <td className="py-3 px-4 text-gray-900">{phone.nearestStation || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">アクセス</td>
                <td className="py-3 px-4 text-gray-900">{phone.access || "-"}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">公式サイト</td>
                <td className="py-3 px-4 text-gray-900">
                  {phone.website && phone.website !== "-" ? (
                    <a 
                      href={phone.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline"
                    >
                      {phone.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>



        {/* Reviews List */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            口コミ一覧 ({reviews.length}件)
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-secondary">
                まだ口コミがありません。<br />
                最初の投稿者になりましょう。
              </p>
            </div>
          )}
        </div>

        {/* Review Form */}
        <div id="review-form">
          <ReviewForm phoneNumber={phone.number} />
        </div>
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
