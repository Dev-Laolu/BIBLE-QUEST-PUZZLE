import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { User, Trophy, Milestone, ShieldCheck, Gamepad2, Lightbulb } from "lucide-react";
import { AuthModal } from "./AuthModal";

export const ProfileView: React.FC = () => {
  const { profile, isGuest, logOut } = useGame();
  const [authOpen, setAuthOpen] = useState(false);

  if (!profile) return null;

  // Let's compute virtual XP details
  const currentXP = profile.xp;
  const xpPerLevel = 500;
  const progressToNext = currentXP % xpPerLevel;
  const progressPercent = Math.min(Math.round((progressToNext / xpPerLevel) * 100), 100);
  const nextLevelXP = xpPerLevel - progressToNext;

  return (
    <div className="space-y-6">
      {/* Profile Card Header */}
      <div className="bg-[#150d09] p-6 rounded-3xl border border-[#3d271b] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left w-full md:w-auto">
          <div className="w-16 h-16 rounded-full bg-[#2d1b14] flex items-center justify-center text-[#d4af37] shrink-0 border border-[#3d271b]">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#d4af37] leading-tight">
                {profile.username}
              </h2>
              {isGuest ? (
                <span className="bg-[#1f130d] border border-[#3d271b] text-stone-500 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  Guest
                </span>
              ) : (
                <span className="bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] text-[10px] uppercase font-mono px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                  Synced
                </span>
              )}
            </div>

            <p className="text-xs text-[#8a6d1a] font-mono tracking-widest uppercase">
              ROLE: SCRIPTURE PILGRIM SCHOLAR
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {isGuest ? (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex-grow md:flex-grow-0 bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] text-[#0c0806] font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md hover:brightness-110 cursor-pointer"
            >
              Sync Progress (Google)
            </button>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex-grow md:flex-grow-0 border border-[#3d271b] bg-[#1f130d] hover:bg-[#2d1b14] text-stone-300 font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Account Details
            </button>
          )}

          <button
            onClick={() => setAuthOpen(true)}
            className="flex-grow md:flex-grow-0 border border-[#3d271b] bg-[#1f130d] hover:bg-[#2d1b14] text-stone-300 font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Edit Name
          </button>
        </div>
      </div>

      {/* Level progression cards */}
      <div className="bg-[#150d09] border border-[#3d271b] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-serif font-bold text-stone-200 text-sm">
              Level Progression {profile.level}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-stone-500">
            {currentXP} Total XP
          </span>
        </div>

        {/* Beautiful progress bar */}
        <div className="space-y-2">
          <div className="relative w-full h-3 bg-[#0c0806] rounded-full overflow-hidden border border-[#3d271b]">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono text-stone-500">
            <span>Progress: {progressPercent}%</span>
            <span>{nextLevelXP} XP to Level {profile.level + 1}</span>
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Games played */}
        <div className="bg-[#150d09] p-5 rounded-3xl border border-[#3d271b] shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-sky-500/10 text-sky-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-stone-500 uppercase tracking-wider font-mono font-bold">
              SEARCH RUNS
            </span>
            <span className="text-xl font-extrabold text-stone-200 font-mono">
              {profile.gamesPlayed}
            </span>
          </div>
        </div>

        {/* Total Points */}
        <div className="bg-[#150d09] p-5 rounded-3xl border border-[#3d271b] shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-[#d4af37]/10 text-[#d4af37]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-stone-500 uppercase tracking-wider font-mono font-bold">
              TOTAL XP
            </span>
            <span className="text-xl font-extrabold text-stone-200 font-mono">
              {profile.xp}
            </span>
          </div>
        </div>

        {/* Hints used */}
        <div className="bg-[#150d09] p-5 rounded-3xl border border-[#3d271b] shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-450">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-stone-500 uppercase tracking-wider font-mono font-bold">
              HINTS CALLED
            </span>
            <span className="text-xl font-extrabold text-stone-200 font-mono">
              {profile.hintsUsed}
            </span>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};
