"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/app/lib/supabaseClient";
import { createReview } from "@/app/lib/supabase";

interface ReviewFormProps {
  phoneNumber: string;
}

export default function ReviewForm({ phoneNumber }: ReviewFormProps) {
  const router = useRouter();
  const [callerSource, setCallerSource] = useState("");
  const [callPurpose, setCallPurpose] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (num: string) => {
    // 既にハイフンが含まれている場合はそのまま返す
    if (num.includes("-")) {
      return num;
    }
    
    const cleaned = num.replace(/[-\s]/g, "");
    
    // 10桁または11桁の電話番号をフォーマット
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    return num;
  };

  const formattedNumber = formatPhoneNumber(phoneNumber);
  const maxCommentLength = 1000;
  const remainingChars = maxCommentLength - comment.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsSubmitting(true);

    try {
      // 電話番号からphone_number_idを取得
      const supabase = createSupabaseClient();
      const cleanNumber = phoneNumber.replace(/[-\s]/g, "");

      const { data: phoneData, error: phoneError } = await supabase
        .from("phone_numbers")
        .select("id")
        .eq("number", cleanNumber)
        .single();

      if (phoneError || !phoneData) {
        // 電話番号が存在しない場合は新規作成（オプション）
        // ここではエラーとして扱う
        setError("電話番号が見つかりませんでした");
        setIsSubmitting(false);
        return;
      }

      // 口コミを作成
      const result = await createReview({
        phone_number_id: phoneData.id,
        call_source: callerSource.trim() || null,
        call_purpose: callPurpose.trim() || null,
        body: comment.trim() || null,
        rating: null,
      });

      if (result.success) {
        // 投稿成功後、ページをリロードして最新データを表示
        router.refresh();
        // フォームをリセット
        setCallerSource("");
        setCallPurpose("");
        setComment("");
        // 成功メッセージ（オプション）
        alert("口コミを投稿しました。");
      } else {
        setError(result.error || "口コミの投稿に失敗しました");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "口コミの投稿に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
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

      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="px-4 py-4 bg-gray-50">
        <div className="flex">
          <div className="w-[200px]"></div>
          <div className="flex-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-2 rounded font-medium transition-colors ${
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "投稿中..." : "投稿する"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
