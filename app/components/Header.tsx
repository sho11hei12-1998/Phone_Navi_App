"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  
  // 詳細ページかどうかを判定（/detail/で始まるパス）
  const isDetailPage = pathname?.startsWith("/detail/");
  
  const handleScrollToReviewForm = () => {
    const reviewForm = document.getElementById("review-form");
    if (reviewForm) {
      reviewForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchKeyword = query.trim();
    if (searchKeyword) {
      // 検索結果ページに遷移
      router.push(`/search_detail?q=${encodeURIComponent(searchKeyword)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Navigation Links - Top Center */}
        <div className="flex items-center justify-center gap-0 py-3">
          <Link href="/" className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900">
            ホーム
          </Link>
          <div className="w-px h-4 bg-red-500 mx-1"></div>
          <Link href="/" className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900">
            固定電話
          </Link>
          <div className="w-px h-4 bg-yellow-400 mx-1"></div>
          <Link href="/" className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900">
            携帯電話
          </Link>
          <div className="w-px h-4 bg-green-300 mx-1"></div>
          <Link href="/" className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900">
            フリーダイヤル
          </Link>
          <div className="w-px h-4 bg-blue-500 mx-1"></div>
          <Link href="/" className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900">
            IP電話
          </Link>
        </div>

        {/* Main Search Section */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 pb-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="#22c55e"
                className="w-8 h-8"
              >
              </svg>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-600">PhoneNavi</span>
                <div className="text-xs text-gray-600">電話番号検索</div>
              </div>
            </div>
          </Link>

          {/* Search Bar and Button Container */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-6 flex-1 lg:flex-initial">
            {/* Search Bar */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 lg:flex-shrink-0 lg:w-[600px]">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="電話番号、事業者名、住所などのキーワードから検索"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-green-600 text-white rounded-lg p-3 hover:bg-green-700 transition-colors flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
