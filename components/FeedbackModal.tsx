"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Send } from "lucide-react";
import { storage } from "@/lib/storage";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemId: string;
  problemTitle: string;
}

export function FeedbackModal({
  isOpen,
  onClose,
  problemId,
  problemTitle,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      storage.saveFeedback({
        problemId,
        rating,
        comment,
      });
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        // Reset state after close
        setRating(0);
        setComment("");
        setIsSubmitted(false);
      }, 1500);
    }
  };

  const handleSkip = () => {
    onClose();
    setRating(0);
    setComment("");
    setIsSubmitted(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed inset-0 bg-black/30 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {isSubmitted ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <Star size={32} className="text-green-600 fill-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Thank you!
                </h3>
                <p className="text-gray-600">Your feedback helps us improve.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-bold text-gray-900">
                    How was this session?
                  </h2>
                  <button
                    onClick={handleSkip}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">
                    You practiced:{" "}
                    <span className="font-medium text-gray-900">
                      {problemTitle}
                    </span>
                  </p>

                  {/* Star Rating */}
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={`transition-colors ${
                            star <= (hoveredRating || rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Optional Comment */}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Any additional thoughts? (optional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 bg-gray-50 border-t">
                  <button
                    onClick={handleSkip}
                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    <span>Submit</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
