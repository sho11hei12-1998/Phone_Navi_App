"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/app/lib/supabaseClient";

interface BusinessFormProps {
  phoneNumberId: number;
  phoneNumber: string;
  displayNumber?: string;
  existingBusiness?: {
    name: string | null;
    industry: string | null;
    postal_code: string | null;
    address: string | null;
    contact_tel: string | null;
    nearest_station: string | null;
    access_info: string | null;
    website_url: string | null;
  } | null;
}

export default function BusinessForm({ phoneNumberId, phoneNumber, displayNumber, existingBusiness }: BusinessFormProps) {
  const router = useRouter();
  const [name, setName] = useState(existingBusiness?.name || "");
  const [industry, setIndustry] = useState(existingBusiness?.industry || "");
  const [postalCode, setPostalCode] = useState(existingBusiness?.postal_code || "");
  const [address, setAddress] = useState(existingBusiness?.address || "");
  const [contactTel, setContactTel] = useState(existingBusiness?.contact_tel || "");
  const [nearestStation, setNearestStation] = useState(existingBusiness?.nearest_station || "");
  const [accessInfo, setAccessInfo] = useState(existingBusiness?.access_info || "");
  const [websiteUrl, setWebsiteUrl] = useState(existingBusiness?.website_url || "");
  const [captchaCode, setCaptchaCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (num: string) => {
    const cleaned = num.replace(/[-\s]/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return num;
  };

  // displayNumberがあればそれを使用、なければフォーマットしたphoneNumberを使用
  const formattedNumber = displayNumber || formatPhoneNumber(phoneNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("事業者名は必須です");
      return;
    }

    // 簡易的な認証コードチェック（実際の実装では適切なCAPTCHAを使用）
    if (!captchaCode.trim()) {
      setError("認証コードを入力してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createSupabaseClient();

      // 既存の事業者情報があるかチェック（business_idが必要なため）
      const { data: existingBusiness, error: businessError } = await supabase
        .from("businesses")
        .select("id")
        .eq("phone_number_id", phoneNumberId)
        .single();

      if (businessError || !existingBusiness) {
        setError("事業者情報が見つかりませんでした。更新リクエストは既存の事業者情報がある場合のみ送信できます。");
        setIsSubmitting(false);
        return;
      }

      // ユーザーIDを取得（任意、エラーが発生しても続行）
      let requestedBy: string | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        requestedBy = user?.id || null;
      } catch (authError) {
        // 認証情報の取得に失敗しても続行（requested_byは任意）
      }

      // 事業者情報更新リクエストをbusiness_update_requestsテーブルにインサート
      const { error: insertError } = await supabase
        .from("business_update_requests")
        .insert({
          business_id: existingBusiness.id,
          name: name.trim() || null,
          industry: industry.trim() || null,
          postal_code: postalCode.trim() || null,
          address: address.trim() || null,
          contact_tel: contactTel.trim() || null,
          nearest_station: nearestStation.trim() || null,
          access_info: accessInfo.trim() || null,
          website_url: websiteUrl.trim() || null,
          requested_by: requestedBy,
          status: "pending",
        });

      if (insertError) {
        setError(insertError.message || "更新リクエストの送信に失敗しました");
        setIsSubmitting(false);
        return;
      }

      // 成功時はページをリロード
      router.refresh();
      alert("事業者情報の更新リクエストを送信しました");
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新リクエストの送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg overflow-hidden mt-6 mb-6">
      {/* Header */}
      <div className="bg-green-600 px-4 py-3">
        <h3 className="text-sm font-bold text-white">
          {formattedNumber}の事業者情報提供
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {/* 電話番号 */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-center">
            <label className="text-sm font-medium text-gray-900">電話番号</label>
          </div>
          <div className="flex-1 px-4 py-4 flex items-center">
            <span className="text-sm text-gray-900">{formattedNumber}</span>
          </div>
        </div>

        {/* 事業者名(必須) */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">
              事業者名<span className="text-red-600">(必須)</span>
            </label>
          </div>
          <div className="flex-1 px-4 py-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* 業種 */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">業種</label>
          </div>
          <div className="flex-1 px-4 py-4">
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 住所 */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">住所</label>
          </div>
          <div className="flex-1 px-4 py-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 最寄り駅 */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">最寄り駅</label>
          </div>
          <div className="flex-1 px-4 py-4">
            <input
              type="text"
              value={nearestStation}
              onChange={(e) => setNearestStation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* アクセス */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">アクセス</label>
          </div>
          <div className="flex-1 px-4 py-4">
            <input
              type="text"
              value={accessInfo}
              onChange={(e) => setAccessInfo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 公式サイト */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">公式サイト</label>
          </div>
          <div className="flex-1 px-4 py-4">
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* 認証コード(必須) */}
        <div className="flex">
          <div className="bg-green-50 px-4 py-4 w-[200px] flex items-start">
            <label className="text-sm font-medium text-gray-900">
              認証コード<span className="text-red-600">(必須)</span>
            </label>
          </div>
          <div className="flex-1 px-4 py-4">
            <div className="space-y-2">
              <div className="w-32 h-10 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-lg font-mono">
                CAPTCHA
              </div>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
              >
                画像を変更
              </button>
              <input
                type="text"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                placeholder="認証コードを入力"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
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
          <div className="flex-1 flex items-center gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-2 rounded font-medium transition-colors ${
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </button>
            <p className="text-xs text-gray-500">
              ※ブラウザで Cookie を有効にしていない場合は、事業者情報のご登録ができません。
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}

