"use client";

import { useState } from "react";

interface ReviewFormProps {
  phoneNumber: string;
}

export default function ReviewForm({ phoneNumber }: ReviewFormProps) {
  const [callerSource, setCallerSource] = useState("");
  const [callPurpose, setCallPurpose] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const formatPhoneNumber = (num: string) => {
    const cleaned = num.replace(/[-\s]/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return num;
  };

  const formattedNumber = formatPhoneNumber(phoneNumber);
  const maxCommentLength = 1000;
  const remainingChars = maxCommentLength - comment.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("電話相手の総合評価を選択してください");
      return;
    }
    // TODO: API連携
    alert("口コミの投稿機能は現在準備中です");
  };

  return (
    <form id="review-form" onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 px-4 py-3">
        <h3 className="text-sm font-bold text-white">
          {formattedNumber}の口コミを書く
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {/* 通話の内容 Section */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">通話の内容</label>
          </div>
          <div className="flex-1 px-4 py-4">
            <p className="text-xs text-black mb-3">詳細情報をご存知であれば教えてください</p>
            <div className="space-y-3">
              <div>
              <p className="text-xs text-black mt-1">どこからの電話でしたか?</p>
                <input
                  type="text"
                  value={callerSource}
                  onChange={(e) => setCallerSource(e.target.value)}
                  placeholder="不明な時は入力不要"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
              <p className="text-xs text-black mt-1">電話の目的は何でしたか?</p>
                <input
                  type="text"
                  value={callPurpose}
                  onChange={(e) => setCallPurpose(e.target.value)}
                  placeholder="不明な時は入力不要"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 口コミ Section */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">口コミ</label>
          </div>
          <div className="flex-1 px-4 py-4">
            <p className="text-xs text-black mb-2">他にも情報があればご記入ください</p>
            <textarea
              value={comment}
              onChange={(e) => {
                if (e.target.value.length <= maxCommentLength) {
                  setComment(e.target.value);
                }
              }}
              rows={6}
              placeholder="口コミ投稿で他のユーザーから情報を得られる場合があります"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              あと{remainingChars}文字入力できます
            </p>
          </div>
        </div>

        {/* 電話相手の総合評価 Section */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">
              電話相手の総合評価 <span className="text-red-600">(必須)</span>
            </label>
          </div>
          <div className="flex-1 px-4 py-4 flex items-center">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={star <= rating ? "#FFD700" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke={star <= rating ? "#FFD700" : "#D1D5DB"}
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="px-4 py-4 bg-gray-50 flex justify-center">
        <button
          type="submit"
          className="w-auto px-8 bg-gray-300 text-gray-700 font-medium py-2 rounded hover:bg-gray-400 transition-colors"
        >
          投稿する
        </button>
      </div>
    </form>
  );
}
