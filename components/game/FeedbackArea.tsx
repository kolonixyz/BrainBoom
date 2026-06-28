"use client";

import { GameFeedback } from "@/types";

interface FeedbackAreaProps {
  feedback: GameFeedback;
}

export function FeedbackArea({ feedback }: FeedbackAreaProps) {
  if (!feedback) return null;

  return (
    <div className="h-8 flex items-center justify-center">
      <p
        className={`text-sm font-medium animate-fade-in ${
          feedback.type === "praise" ? "text-success" : "text-error"
        }`}
      >
        {feedback.text}
      </p>
    </div>
  );
}
