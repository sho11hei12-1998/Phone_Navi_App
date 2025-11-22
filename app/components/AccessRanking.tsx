import Link from "next/link";

interface RankingItem {
  rank: number;
  name: string;
  count: number;
  phoneNumber?: string;
}

const weeklyAccessRanking: RankingItem[] = [
  { rank: 1, name: "電話世論調査研究所 (株式会社メディアジャパンリサーチ)", count: 42046, phoneNumber: "0120123456" },
  { rank: 2, name: "九州電力会社", count: 33772, phoneNumber: "0921234567" },
  { rank: 3, name: "ニセ電力会社の自動音声アンケート", count: 25674, phoneNumber: "08012345678" },
  { rank: 4, name: "株式会社グリーン・シップ", count: 24615, phoneNumber: "0312345678" },
  { rank: 5, name: "ニセ電力会社の自動音声アンケート", count: 24590, phoneNumber: "08023456789" },
  { rank: 6, name: "ニセ電力会社の自動音声アンケート", count: 24118, phoneNumber: "08034567890" },
  { rank: 7, name: "ニセ電力会社の自動音声アンケート", count: 23598, phoneNumber: "08045678901" },
  { rank: 8, name: "ニセ電力会社の自動音声アンケート", count: 20557, phoneNumber: "08056789012" },
  { rank: 9, name: "悪質光回線業者", count: 20058, phoneNumber: "0120999888" },
  { rank: 10, name: "ニセ電力会社の自動音声アンケート", count: 19971, phoneNumber: "08067890123" },
];

export default function AccessRanking() {
  const getCrownIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700" className="w-5 h-5">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-1h8.6l.9-6.4-2.1 2.8L12 8l-3.1 4.4-2.1-2.8L7.7 15z" />
        </svg>
      );
    }
    if (rank === 2) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#C0C0C0" className="w-5 h-5">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-1h8.6l.9-6.4-2.1 2.8L12 8l-3.1 4.4-2.1-2.8L7.7 15z" />
        </svg>
      );
    }
    if (rank === 3) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#CD7F32" className="w-5 h-5">
          <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-1h8.6l.9-6.4-2.1 2.8L12 8l-3.1 4.4-2.1-2.8L7.7 15z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <section className="bg-white border border-gray-300 rounded-lg mb-4">
      {/* Header */}
      <div className="bg-yellow-50 border-b border-gray-200">
        <div className="px-4 py-2">
          <h2 className="text-sm font-bold text-gray-900">週間人気アクセス数ランキング</h2>
        </div>
      </div>

      {/* Ranking List */}
      <div>
        {weeklyAccessRanking.map((item, index) => (
          <div
            key={item.rank}
            className={`px-4 py-3 ${
              index !== weeklyAccessRanking.length - 1 ? "border-b border-dotted border-gray-300" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 min-w-[60px]">
                {getCrownIcon(item.rank)}
                <span className="text-sm font-medium text-gray-700">{item.rank}位</span>
              </div>
              <div className="flex-1 min-w-0">
                {item.phoneNumber ? (
                  <Link
                    href={`/phone/${item.phoneNumber}`}
                    className="text-sm text-gray-900 hover:text-blue-600 hover:underline truncate block"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-900 truncate block">{item.name}</span>
                )}
              </div>
              <div className="text-sm text-gray-600 whitespace-nowrap ml-2">
                {item.count.toLocaleString()}回
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

