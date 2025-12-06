"use client";

import { Review } from "@/app/lib/types";
import { createReviewReport } from "@/app/lib/supabase";
import { useState } from "react";

interface ReviewCardProps {
  review: Review;
}

// 日時を「YYYY/MM/DD HH:mm:ss」形式にフォーマット
function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [isReporting, setIsReporting] = useState(false);
  const formattedDate = formatDateTime(review.createdAt);
  
  // call_sourceとcall_purposeを表示用にフォーマット
  const formatCallInfo = (): string | null => {
    const source = review.callSource || "";
    const purpose = review.callPurpose || "";
    
    if (!source && !purpose) {
      return null;
    }
    
    if (source && purpose) {
      return `${source}／${purpose}`;
    } else if (source) {
      return source;
    } else {
      return purpose;
    }
  };
  
  const callInfo = formatCallInfo();
  
  const handleReport = async () => {
    // 確認ダイアログを表示
    const confirmed = window.confirm("この口コミを通報しますか？");
    
    if (!confirmed) {
      return;
    }
    
    setIsReporting(true);
    
    try {
      const result = await createReviewReport(parseInt(review.id));
      
      if (result.success) {
        alert("通報を受け付けました。");
      } else {
        alert(result.error || "通報に失敗しました。");
      }
    } catch (error) {
      alert("通報に失敗しました。");
    } finally {
      setIsReporting(false);
    }
  };
  
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs text-secondary whitespace-nowrap">
          {formattedDate}
        </span>
      </div>

      {callInfo && (
        <div className="mb-2">
          <span className="text-sm text-foreground">{callInfo}</span>
        </div>
      )}

      <p className="text-foreground leading-relaxed mb-4">{review.comment}</p>

      <div className="flex items-center justify-end text-sm text-secondary">
        <button
          onClick={handleReport}
          disabled={isReporting}
          className={`flex items-center gap-1 hover:text-danger transition-colors ${
            isReporting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          <span>{isReporting ? "通報中..." : "通報"}</span>
        </button>
      </div>
    </div>
  );
}
