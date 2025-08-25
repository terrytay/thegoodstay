"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LandingAnimationProps {
  onAnimationComplete: () => void;
}

export default function LandingAnimation({
  onAnimationComplete,
}: LandingAnimationProps) {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Hide scrollbar during animation
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      setShowAnimation(false);
      setTimeout(() => {
        document.body.style.overflow = "unset"; // Restore scrollbar
        onAnimationComplete();
      }, 800); // Allow fade out to complete
    }, 3000); // Show for 3 seconds

    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, [onAnimationComplete]);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1
              className="font-playfair text-white text-6xl md:text-8xl font-bold tracking-wider mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              THE GOOD STAY
            </motion.h1>

            <motion.p
              className="text-white text-lg md:text-xl font-light tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Wholesome living made for the goodest lives
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
