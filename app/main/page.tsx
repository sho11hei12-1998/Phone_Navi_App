import Header from "../components/Header";
import Keyword from "../components/Keyword";
import NewReview from "../components/NewReview";
import AccessRanking from "../components/AccessRanking";
import ReviewRanking from "../components/ReviewRanking";
import Link from "next/link";
import PhoneCard from "../components/PhoneCard";
import { getLatestKeywords } from "../lib/supabase";

export default async function MainPage() {
  const latestKeywords = await getLatestKeywords(20);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content with Rankings */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Latest Keywords - Full Width */}
        <div className="mb-4">
          <div className="bg-white border border-gray-300 rounded-lg">
            <div className="px-4 py-3">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">最新のキーワード</span>
                <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
                  {latestKeywords.length > 0 ? (
                    latestKeywords.map((keyword, index) => (
                      <Link
                        key={index}
                        href={`/search_detail?q=${encodeURIComponent(keyword)}`}
                        className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        {keyword}
                      </Link>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">キーワードがまだありません。</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Popular Keywords, New Review, Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-4">
            <Keyword />
            <NewReview />
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            <AccessRanking />
            <ReviewRanking />
          </div>
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


