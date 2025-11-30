"use client";

import { useState, useEffect, useRef } from "react";
import BusinessForm from "./BusinessForm";
import type { BusinessRow } from "@/app/lib/database.types";

interface BusinessInfoCardProps {
  displayNumber: string;
  business: BusinessRow | null;
  phoneNumberId: number;
  phoneNumber: string;
}

export default function BusinessInfoCard({ displayNumber, business, phoneNumberId, phoneNumber }: BusinessInfoCardProps) {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm && formRef.current) {
      // フォームが表示されたらスムーズにスクロール
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm]);

  return (
    <>
      {business ? (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {displayNumber}の事業者詳細情報
            </h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-green-600 rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              事業者情報更新
            </button>
          </div>

          <table className="w-full">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium w-1/3 bg-green-50">事業者名称</td>
                <td className="py-3 px-4 text-gray-900">{business.name || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">業種</td>
                <td className="py-3 px-4 text-gray-900">{business.industry || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">郵便番号</td>
                <td className="py-3 px-4 text-gray-900">{business.postal_code || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">住所</td>
                <td className="py-3 px-4 text-gray-900">{business.address || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">問い合わせ先</td>
                <td className="py-3 px-4 text-gray-900">{business.contact_tel || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">最寄り駅</td>
                <td className="py-3 px-4 text-gray-900">{business.nearest_station || "-"}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">アクセス</td>
                <td className="py-3 px-4 text-gray-900">{business.access_info || "-"}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-900 font-medium bg-green-50">公式サイト</td>
                <td className="py-3 px-4 text-gray-900">
                  {business.website_url && business.website_url !== "-" ? (
                    <a 
                      href={business.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 underline"
                    >
                      {business.website_url}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              {displayNumber}の事業者詳細情報
            </h3>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gray-300 text-gray-700 rounded px-3 py-1.5 text-xs font-medium hover:bg-gray-400 transition-colors whitespace-nowrap"
            >
              事業者情報登録
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            <p className="text-sm text-gray-900 mb-2">
              この電話番号の事業者情報は未登録です。
            </p>
            <p className="text-sm text-gray-900">
              事業者を登録する場合は
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-blue-600 hover:text-blue-800 hover:underline mx-1"
              >
                こちら
              </button>
              から登録してください。
            </p>
          </div>
        </div>
      )}

      {showForm && (
        <div ref={formRef}>
          <BusinessForm
            phoneNumberId={phoneNumberId}
            phoneNumber={phoneNumber}
            displayNumber={displayNumber}
            existingBusiness={business}
          />
        </div>
      )}
    </>
  );
}

