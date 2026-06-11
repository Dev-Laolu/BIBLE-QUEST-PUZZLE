import React from "react";
import { useGame } from "../context/GameContext";
import { Trophy, Calendar, Medal, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export const LeaderboardView: React.FC = () => {
  const { leaderboard, currentDayId, user } = useGame();

  const getDayFormat = (dayId: string) => {
    try {
      const [year, month, day] = dayId.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dayId;
    }
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <div className="bg-[#150d09] p-6 rounded-3xl border border-[#3d271b] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest font-serif">
            <Trophy className="w-4 h-4 text-[#d4af37]" />
            Competitive Arena
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#d4af37] leading-tight">
            Daily Leaderboard
          </h2>
          <p className="text-sm text-stone-400">
            Compete in friendly competition and test your scripture speed against others!
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#1f130d] px-4 py-2.5 rounded-xl border border-[#3d271b] self-stretch md:self-auto justify-center text-xs font-mono font-bold text-stone-400">
          <Calendar className="w-4 h-4 text-[#d4af37]" />
          <span>{getDayFormat(currentDayId)}</span>
        </div>
      </div>

      {/* Leaderboard Entries List */}
      <div className="bg-[#150d09] border border-[#3d271b] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#3d271b] bg-[#1f130d] flex items-center justify-between">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
            Pilgrim Scholar
          </span>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono mr-2">
            Record Score
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 text-stone-500 space-y-2">
            <Trophy className="w-12 h-12 mx-auto stroke-1 text-[#d4af37]" />
            <p className="text-sm">No scores submitted yet for today.</p>
            <p className="text-xs text-stone-600">Be the first to complete a quest and forge a score!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#3d271b]">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = user && entry.userId === user.uid;
              const isGuestUser = entry.userId === "guest";

              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.15 }}
                  key={`${entry.userId}-${index}`}
                  className={`flex items-center justify-between p-4 px-5 transition-all
                    ${
                      isCurrentUser || isGuestUser
                        ? "bg-[#2d1b14] border-y border-[#3d271b] font-semibold"
                        : "hover:bg-[#1f130d]"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="w-8 flex justify-center">
                      {rank === 1 ? (
                        <Medal className="w-6 h-6 text-[#d4af37]" />
                      ) : rank === 2 ? (
                        <Medal className="w-6 h-6 text-stone-400" />
                      ) : rank === 3 ? (
                        <Medal className="w-6 h-6 text-[#8a6d1a]" />
                      ) : (
                        <span className="text-sm font-mono text-stone-500 font-bold">{rank}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-200">
                          {entry.username}
                        </span>
                        {isCurrentUser && (
                          <span className="bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-bold">
                            YOU
                          </span>
                        )}
                        {isGuestUser && (
                          <span className="bg-[#1f130d] border border-[#3d271b] text-stone-450 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded">
                            GUEST
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-0.5">
                        <span>Level Unlocked: {entry.level}</span>
                        <span>•</span>
                        <span>{entry.hintsUsed} Hints Used</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-black text-[#d4af37]">
                      {entry.score}
                    </span>
                    <span className="block text-[9px] text-[#8a6d1a] font-mono">PTS</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules Notice */}
      <div className="p-4 bg-[#1f130d] rounded-2xl border border-[#3d271b] flex items-start gap-2.5">
        <Sparkles className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest font-mono">
            How scoring is computed:
          </h4>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Every completed level provides a base 100 points per searched word. An extra timer bonus of up to 500 points is awarded for speed. Advanced levels apply double multipliers, while each hint used deducts 40 points. Let your knowledge shine!
          </p>
        </div>
      </div>
    </div>
  );
};
