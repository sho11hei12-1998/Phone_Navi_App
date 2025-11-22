import Link from "next/link";

interface RankingItem {
  rank: number;
  name: string;
  count: number;
  phoneNumber?: string;
}

const weeklyReviewRanking: RankingItem[] = [
  { rank: 1, name: "ニセ電力会社の自動音声アンケート", count: 252, phoneNumber: "08012345678" },
  { rank: 2, name: "ニセ電力会社の自動音声アンケート", count: 222, phoneNumber: "08023456789" },
  { rank: 3, name: "九州電力会社", count: 138, phoneNumber: "0921234567" },
  { rank: 4, name: "", count: 137, phoneNumber: "0312345678" },
];

export default function ReviewRanking() {
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
          <h2 className="text-sm font-bold text-gray-900">週間口コミ獲得数ランキング</h2>
        </div>
      </div>

      {/* Ranking List */}
      <div>
        {weeklyReviewRanking.map((item, index) => (
          <div
            key={item.rank}
            className={`px-4 py-3 ${
              index !== weeklyReviewRanking.length - 1 ? "border-b border-dotted border-gray-300" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 min-w-[60px]">
                {getCrownIcon(item.rank)}
                <span className="text-sm font-medium text-gray-700">{item.rank}位</span>
              </div>
              <div className="flex-1 min-w-0">
                {item.name ? (
                  item.phoneNumber ? (
                    <Link
                      href={`/phone/${item.phoneNumber}`}
                      className="text-sm text-gray-900 hover:text-blue-600 hover:underline truncate block"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-900 truncate block">{item.name}</span>
                  )
                ) : (
                  <span className="text-sm text-gray-400 italic">（名称なし）</span>
                )}
              </div>
              <div className="text-sm text-gray-600 whitespace-nowrap ml-2">
                {item.count}個
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

