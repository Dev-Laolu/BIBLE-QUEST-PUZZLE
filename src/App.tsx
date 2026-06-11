import React, { useState, useEffect } from "react";
import { GameProvider, useGame } from "./context/GameContext";
import { BIBLE_THEMES } from "./bibleThemes";
import { WordSearchBoard } from "./components/WordSearchBoard";
import { LeaderboardView } from "./components/LeaderboardView";
import { CommunityFeed } from "./components/CommunityFeed";
import { ProfileView } from "./components/ProfileView";
import { AuthGate } from "./components/AuthGate";
import { AdminPanel } from "./components/AdminPanel";
import {
  Compass,
  Trophy,
  Users,
  User as UserIcon,
  Play,
  Lock,
  Sparkles,
  BookOpen,
  Info,
  ArrowLeft,
  Tv,
  Loader2,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function MainAppContent() {
  const { profile, loading, isGuest, user, isAdmin, logOut } = useGame();

  // 1. Initial 5-second Splash Loader State
  const [showSplash, setShowSplash] = useState(true);
  const [splashSeconds, setSplashSeconds] = useState(5);
  const [splashMsgIndex, setSplashMsgIndex] = useState(0);

  const loaderMessages = [
    "Compiling holy ancient texts...",
    "Carving the Sinai stone tablets...",
    "Polishing searching lenses...",
    "Unrolling the historical scriptures...",
    "Sanctifying user credentials..."
  ];

  useEffect(() => {
    // 5-second splash count down
    const secTimer = setInterval(() => {
      setSplashSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(secTimer);
          setShowSplash(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Messages switcher index
    const msgTimer = setInterval(() => {
      setSplashMsgIndex((prev) => (prev + 1) % loaderMessages.length);
    }, 1100);

    return () => {
      clearInterval(secTimer);
      clearInterval(msgTimer);
    };
  }, []);

  // 2. Active Selected Stage/Level Level state (default to player's level)
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  // Sync selected level when profile details load
  useEffect(() => {
    if (profile && profile.level) {
      setSelectedLevel(profile.level);
    }
  }, [profile]);

  // 3. Immersive Overlay / Popup Navigation Panels
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [fellowshipOpen, setFellowshipOpen] = useState(false);
  // fellowshipActiveTab controls which child view inside the pop-up fellowship center is loaded
  const [fellowshipActiveTab, setFellowshipActiveTab] = useState<"leaderboard" | "feed" | "profile">("leaderboard");

  // Loading indicator for background authentication check
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0806] text-stone-400">
        <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mb-4" />
        <p className="text-sm font-semibold tracking-wide font-mono animate-pulse text-[#d4af37]">
          VERIFYING SACRED CHANNELS...
        </p>
      </div>
    );
  }

  // A. Gorgeous 5-second splash loading page
  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0c0806] text-stone-200 relative overflow-hidden font-sans select-none">
        {/* Glowing backdrop halo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(138,109,26,0.15)_0%,transparent_60%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 z-10 p-6 max-w-sm w-full"
        >
          {/* Pulsating logo ring */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-[#d4af37]/30"
            />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8a6d1a] flex items-center justify-center text-[#0c0806] shadow-[0_0_25px_rgba(212,175,55,0.4)]">
              <BookOpen className="w-8 h-8 stroke-2" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-extrabold tracking-wide text-[#d4af37]">
              Bible Quest
            </h1>
            <p className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-stone-500">
              Word Search • Local Edition
            </p>
          </div>

          {/* Progress loader simulation */}
          <div className="space-y-2 max-w-xs mx-auto">
            <div className="h-1.5 w-full bg-[#1c110b] rounded-full border border-[#3d271b] overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-[#8a6d1a] to-[#d4af37]"
              />
            </div>
            <div className="flex items-center justify-between font-mono text-[9px] text-[#8a6d1a]">
              <span>LOADING CHRONICLE ({splashSeconds}s)</span>
              <span>100% OFFLINE ENCODED</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={splashMsgIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-stone-400 font-serif text-sm italic tracking-wide"
            >
              {loaderMessages[splashMsgIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // B. Restricted Admin Panel View
  if (isAdmin) {
    return <AdminPanel />;
  }

  // C. Force Sign-In gating page if no verified session
  if (!user && isGuest) {
    return <AuthGate />;
  }

  // D. Standard Active gameplay theme
  const activeLevelNumber = profile?.level || 1;
  const currentTheme =
    BIBLE_THEMES.find((theme) => theme.level === selectedLevel) || BIBLE_THEMES[0];

  const handleNextLevel = () => {
    const nextLvl = currentTheme.level + 1;
    if (nextLvl <= BIBLE_THEMES.length) {
      setSelectedLevel(nextLvl);
    } else {
      setSelectedLevel(1);
    }
  };

  const handleNavigateToLeaderboard = () => {
    setFellowshipActiveTab("leaderboard");
    setFellowshipOpen(true);
  };

  return (
    <div className="min-h-screen text-[#e7e5e4] pb-12 bg-[#0c0806] transition-colors relative">
      {/* Top Premium Brand Header */}
      <header className="sticky top-0 z-40 bg-[#1f130d] border-b border-[#3d271b] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-[#d4af37] to-[#8a6d1a] flex items-center justify-center text-[#0c0806] shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <BookOpen className="w-5.5 h-5.5 stroke-2 text-[#0c0806]" />
            </div>
          </div>

          {/* Quick HUD Navigation controls */}
          <div className="flex items-center gap-2.5">
            {/* 1. Info Trigger: Pilgrimage Stages Selection */}
            <button
              onClick={() => setChaptersOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#d4af37] bg-[#150d09] border border-[#3d271b] hover:bg-[#2d1b14] transition-all rounded-xl"
            >
              <Info className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden md:inline">Chapters Scroll</span>
            </button>

            {/* 2. Interactive Fellowship Center triggers */}
            <button
              onClick={() => {
                setFellowshipActiveTab("leaderboard");
                setFellowshipOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-200 bg-[#150d09] border border-[#3d271b] hover:bg-[#2d1b14] transition-all rounded-xl"
            >
              <Trophy className="w-4 h-4 text-[#d4af37]" />
              <span className="hidden md:inline">Arena & Fellowship</span>
            </button>

            <div className="h-6 w-[1px] bg-[#3d271b]" />

            {/* Account Profile and Disconnect Trigger */}
            {profile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setFellowshipActiveTab("profile");
                    setFellowshipOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2d1b14] border border-[#3d271b] hover:bg-[#3d271b]/60 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#d4af37]/15 flex items-center justify-center text-[#d4af37] text-xs font-mono font-bold">
                    {profile.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-stone-200 hidden sm:block">
                    {profile.username}
                  </span>
                </button>
                <button
                  onClick={() => logOut()}
                  className="p-1 px-2.5 text-[10px] font-mono text-stone-500 hover:text-rose-400 hover:bg-[#2d1b14]/50 rounded border border-[#3d271b] transition-all"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="min-h-[450px]">
          {/* Main Active word search controller */}
          <WordSearchBoard
            currentTheme={currentTheme}
            onNextLevel={handleNextLevel}
            onNavigateToLeaderboard={handleNavigateToLeaderboard}
          />
        </div>
      </main>

      {/* Overlay Popup 1: Pilgrimage Stages Selection */}
      <AnimatePresence>
        {chaptersOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 flex items-center justify-center animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-5xl bg-[#150d09] border-2 border-[#3d271b] rounded-3xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] flex flex-col"
            >
              {/* Back Button and Header */}
              <div className="flex items-center justify-between border-b border-[#3d271b] pb-4 mb-6">
                <div>
                  <h3 className="text-2xl font-serif font-black text-[#d4af37]">📜 Scripture Chapters</h3>
                  <p className="text-xs text-stone-400">Unlock chronological biblical epochs through rigorous word search quests.</p>
                </div>
                <button
                  onClick={() => setChaptersOpen(false)}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-[#2d1b14] hover:bg-[#3d271b] border border-[#3d271b] text-stone-200 hover:text-[#d4af37] font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Board
                </button>
              </div>

              {/* Grid content scroll container */}
              <div className="overflow-y-auto pr-2 space-y-6 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BIBLE_THEMES.map((theme) => {
                    const isUnlocked = theme.level <= activeLevelNumber;
                    const isSelected = selectedLevel === theme.level;

                    return (
                      <button
                        key={theme.level}
                        disabled={!isUnlocked}
                        onClick={() => {
                          setSelectedLevel(theme.level);
                          setChaptersOpen(false);
                        }}
                        className={`
                          relative overflow-hidden p-4 rounded-2xl border text-left flex flex-col justify-between h-36 transition-all cursor-pointer select-none group
                          ${
                            isSelected
                              ? "bg-[#2d1b14] border-2 border-[#d4af37] text-stone-200 shadow-[0_0_15px_rgba(212,175,55,0.25)] scale-[1.01]"
                              : isUnlocked
                              ? "bg-[#1f130d] border border-[#3d271b] text-stone-300 hover:bg-[#2d1b14] hover:border-[#4a2e23]"
                              : "bg-[#0c0806]/60 border border-[#2d1b14] text-stone-600 cursor-not-allowed opacity-60"
                          }
                        `}
                      >
                        <div className="space-y-1 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-extrabold tracking-widest text-[#8a6d1a]">
                              CHAPTER {theme.level}
                            </span>
                            <span
                              className={`
                                text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide border
                                ${
                                  theme.difficulty === "Beginner"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : theme.difficulty === "Intermediate"
                                    ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                                    : theme.difficulty === "Advanced"
                                    ? "bg-amber-500/10 text-[#d4af37] border-[#d4af37]/20"
                                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                }
                              `}
                            >
                              {theme.difficulty}
                            </span>
                          </div>

                          <h5 className="font-serif font-bold text-sm text-stone-200 group-hover:text-[#d4af37] transition-colors leading-tight line-clamp-1">
                            {theme.title}
                          </h5>
                          <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                            {theme.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#3d271b]/50 mt-1 w-full text-[10px] font-mono">
                          <span className="text-stone-500">{theme.words.length} Words to Find</span>
                          {isUnlocked ? (
                            <Play className="w-3.5 h-3.5 text-[#d4af37] group-hover:translate-x-0.5 transition-transform" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-stone-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Overlay Popup 2: Pilgrim Fellowship & Daily Arena Center */}
      <AnimatePresence>
        {fellowshipOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-4 sm:p-6 md:p-8 flex items-center justify-center animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="w-full max-w-4xl bg-[#150d09] border-2 border-[#3d271b] rounded-3xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] flex flex-col"
            >
              {/* Back Button and Section Tabs Header */}
              <div className="flex items-center justify-between border-b border-[#3d271b] pb-4 mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <button
                    onClick={() => setFellowshipActiveTab("leaderboard")}
                    className={`flex items-center gap-1.5 pb-2 border-b-2 text-xs sm:text-sm font-bold font-mono uppercase tracking-wide cursor-pointer transition-all
                      ${fellowshipActiveTab === "leaderboard"
                        ? "border-[#d4af37] text-[#d4af37]"
                        : "border-transparent text-stone-500 hover:text-stone-300"
                      }
                    `}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Arena Leaderboard</span>
                  </button>

                  <button
                    onClick={() => setFellowshipActiveTab("feed")}
                    className={`flex items-center gap-1.5 pb-2 border-b-2 text-xs sm:text-sm font-bold font-mono uppercase tracking-wide cursor-pointer transition-all
                      ${fellowshipActiveTab === "feed"
                        ? "border-[#d4af37] text-[#d4af37]"
                        : "border-transparent text-stone-500 hover:text-stone-300"
                      }
                    `}
                  >
                    <Users className="w-4 h-4" />
                    <span>Fellowship Feed</span>
                  </button>

                  <button
                    onClick={() => setFellowshipActiveTab("profile")}
                    className={`flex items-center gap-1.5 pb-2 border-b-2 text-xs sm:text-sm font-bold font-mono uppercase tracking-wide cursor-pointer transition-all
                      ${fellowshipActiveTab === "profile"
                        ? "border-[#d4af37] text-[#d4af37]"
                        : "border-transparent text-stone-500 hover:text-stone-300"
                      }
                    `}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Pilgrim Card</span>
                  </button>
                </div>

                <button
                  onClick={() => setFellowshipOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2d1b14] hover:bg-[#3d271b] border border-[#3d271b] text-stone-200 hover:text-[#d4af37] font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Quest
                </button>
              </div>

              {/* Dynamic Child Content scroll canvas */}
              <div className="overflow-y-auto pr-2 space-y-6 flex-1">
                {fellowshipActiveTab === "leaderboard" && <LeaderboardView />}
                {fellowshipActiveTab === "feed" && <CommunityFeed />}
                {fellowshipActiveTab === "profile" && <ProfileView />}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainAppContent />
    </GameProvider>
  );
}
