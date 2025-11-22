import Link from "next/link";
import { Review } from "@/app/lib/types";

interface NewReviewItem {
  phoneNumber: string;
  timestamp: string;
  comment: string;
  reviewId: string;
}

const newReviews: NewReviewItem[] = [
  {
    phoneNumber: "08035526025",
    timestamp: "2025/11/22 17:38:23",
    comment: "不動産株式会社FGHがオートロックマンションに侵入。乱暴でヤクザのような格好をしていました。",
    reviewId: "nr1",
  },
  {
    phoneNumber: "08001706948",
    timestamp: "2025/11/22 16:25:10",
    comment: "auファイナンシャルからの電話でした。",
    reviewId: "nr2",
  },
  {
    phoneNumber: "08007770290",
    timestamp: "2025/11/22 15:12:45",
    comment: "ニセ電力会社の自動音声アンケート。何度も迷惑電話を拒否しました。",
    reviewId: "nr3",
  },
  {
    phoneNumber: "05031498381",
    timestamp: "2025/11/22 14:05:30",
    comment: "自称アマソンビジネスでしたが、アマゾンカスタマーサービスに確認したところ、Amazon法人営業部からの電話でした。",
    reviewId: "nr4",
  },
  {
    phoneNumber: "0120426938",
    timestamp: "2025/11/22 13:20:15",
    comment: "株式会社ペルルセボンからの電話。auの迷惑電話拒否機能で自動的にブロックされました。営業電話と思われます。",
    reviewId: "nr5",
  },
  {
    phoneNumber: "08003009852",
    timestamp: "2025/11/22 12:45:00",
    comment: "ニセ九州電力の自動音声アンケート。福岡からかかってきました。今受けました。",
    reviewId: "nr6",
  },
];

export default function NewReview() {
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
        {newReviews.map((review, index) => (
          <div
            key={review.reviewId}
            className={`px-4 py-3 ${
              index !== newReviews.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1">
                  <Link
                    href={`/phone/${review.phoneNumber}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                  >
                    {review.phoneNumber}
                  </Link>
                  <span className="text-xs text-gray-500 ml-2">
                    ({review.timestamp})
                  </span>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {review.comment}
                </p>
              </div>
              <Link
                href={`/phone/${review.phoneNumber}`}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm whitespace-nowrap flex-shrink-0"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

