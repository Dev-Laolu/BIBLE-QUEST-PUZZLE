import React from "react";
import { useGame } from "../context/GameContext";
import { Users, Sparkles, Flame, UserPlus, Milestone, MessageSquare } from "lucide-react";
import { motion } from "motion/react";

export const CommunityFeed: React.FC = () => {
  const { activities, isGuest } = useGame();

  const getRelativeTime = (isoString: string) => {
    try {
      const past = new Date(isoString);
      const diffMs = Date.now() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const getActivityIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("joined") || lower.includes("profile")) {
      return <UserPlus className="w-4 h-4 text-emerald-400" />;
    }
    if (lower.includes("advanced") || lower.includes("level")) {
      return <Milestone className="w-4 h-4 text-[#d4af37]" />;
    }
    if (lower.includes("score") || lower.includes("leaderboard")) {
      return <Flame className="w-4 h-4 text-rose-400" />;
    }
    return <Sparkles className="w-4 h-4 text-[#d4af37]/70" />;
  };

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="bg-[#150d09] p-6 rounded-3xl border border-[#3d271b] shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest font-serif">
            <Users className="w-4 h-4 text-[#d4af37]" />
            Pilgrim Fellowship
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#d4af37] leading-tight">
            Community Achievements
          </h2>
          <p className="text-sm text-stone-400">
            Witness the leaps, breakthroughs, and scores of fellow players scrolling in real-time.
          </p>
        </div>
      </div>

      {/* Activities Timeline */}
      <div className="bg-[#150d09] border border-[#3d271b] rounded-3xl p-6 shadow-2xl">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-stone-500 space-y-2">
            <MessageSquare className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-sm">No recent activities on the scroll.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-[#3d271b] pl-5 ml-2.5 space-y-6 py-2">
            {activities.map((act, index) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.15 }}
                key={act.id || index}
                className="relative space-y-1"
              >
                {/* Timeline Bullet Anchor */}
                <div className="absolute -left-[30px] top-0.5 w-5 h-5 rounded-full bg-[#1f130d] border-2 border-[#3d271b] flex items-center justify-center">
                  {getActivityIcon(act.text)}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="text-sm">
                    <span className="font-extrabold text-stone-200">
                      {act.username}
                    </span>{" "}
                    <span className="text-stone-400 text-xs">
                      {act.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-stone-500 sm:text-right shrink-0">
                    {getRelativeTime(act.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {isGuest && (
        <div className="p-4 bg-[#1f130d] rounded-2xl border border-[#3d271b] flex items-center gap-3">
          <Milestone className="w-5 h-5 text-[#d4af37] shrink-0" />
          <p className="text-xs text-stone-400 leading-normal">
            You are currently playing as a guest. Connecting your account lets other pilgrims hear about your glorious advances in the fellowship timeline!
          </p>
        </div>
      )}
    </div>
  );
};
