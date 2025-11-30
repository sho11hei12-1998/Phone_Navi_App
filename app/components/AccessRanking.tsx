import Link from "next/link";
import { getWeeklyAccessRanking } from "@/app/lib/supabase";

export default async function AccessRanking() {
  const weeklyAccessRanking = await getWeeklyAccessRanking(10);
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
          <h2 className="text-sm font-bold text-gray-900">直近7日間の人気アクセス数ランキング</h2>
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
                    href={`/detail/${item.phoneNumber.replace(/[-\s]/g, "")}`}
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

