import { motion } from "framer-motion";

export function TrendingBadge() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute top-3 right-3 px-3 py-1 bg-primary text-background text-xs font-bold rounded-full z-10"
    >
      🔥 Tendance
    </motion.div>
  );
}
