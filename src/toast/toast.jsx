"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

export default function Toast({ message, isVisible, onClose, duration = 3000 }) {
  
  // Auto-dismiss the toast after 'duration' milliseconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    // AnimatePresence is required for exit animations to work when the component unmounts
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25 
          }}
          className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 flex items-center gap-3 bg-white border-2 border-[#1e1b26] shadow-[4px_4px_0px_#1e1b26] rounded-2xl p-4 min-w-[300px] max-w-sm"
        >
          {/* Success Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-[#d4f0e0] flex items-center justify-center border-2 border-[#1e7a4e] shrink-0">
            <CheckCircle2 className="w-6 h-6 text-[#1e7a4e]" />
          </div>

          {/* Message */}
          <p className="flex-1 font-bold text-[#1e1b26] text-sm">
            {message}
          </p>

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8f8a9e] hover:text-[#1e1b26] hover:bg-[#f7f5f0] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}