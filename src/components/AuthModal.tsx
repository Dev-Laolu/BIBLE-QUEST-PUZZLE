import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { X, Sparkles, User, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, isGuest, profile, setGuestUsername, logOut } = useGame();
  const [guestNameInput, setGuestNameInput] = useState(profile?.username || "");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSaveGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestNameInput.trim().length >= 2) {
      setGuestUsername(guestNameInput.trim());
      setSuccessMsg("Pilgrim name updated successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md overflow-hidden bg-[#1f130d] rounded-2xl shadow-2xl border border-[#3d271b]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#3d271b] bg-[#150d09]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37] animate-pulse" />
              <h3 className="text-lg font-serif font-bold text-[#d4af37]">
                {isGuest ? "Pilgrim Identity" : "Your Account"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-[#d4af37] transition-colors rounded-lg hover:bg-[#2d1b14]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {!isGuest && profile ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#2d1b14] border border-[#3d271b] flex items-center justify-center text-[#d4af37]">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs text-[#8a6d1a] font-mono tracking-widest uppercase">SIGNED IN PLAYER</p>
                  <h4 className="text-xl font-serif font-bold text-stone-200 mt-1">
                    {profile.username}
                  </h4>
                  <p className="text-sm text-stone-400 mt-1 font-mono">
                    Level {profile.level} • {profile.xp} XP
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={async () => {
                      await logOut();
                      onClose();
                    }}
                    className="w-full px-4 py-2 text-sm font-semibold text-rose-450 bg-rose-955/20 hover:bg-rose-950/30 border border-rose-900/40 rounded-xl transition-colors"
                  >
                    Disconnect Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Google Sync */}
                <div className="space-y-3">
                  <h4 className="text-sm font-serif font-bold text-[#d4af37]">
                    Sync Progress Across Devices
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Link your account with Google. This automatically syncs your level progression, experience points, and competitive scores securely.
                  </p>
                  <button
                    onClick={async () => {
                      await signInWithGoogle();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#150d09] border border-[#3d271b] hover:bg-[#2d1b14] rounded-xl font-bold text-stone-200 text-sm transition-all shadow-sm active:scale-98"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.58c-.28 1.48-1.11 2.73-2.37 3.58v2.98h3.84c2.24-2.06 3.54-5.1 3.54-8.72z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-2.98c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.31v3.08c1.97 3.92 6.01 6.66 10.69 6.66z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.24 14.26a7.22 7.22 0 0 1 0-4.52V6.66H1.31a11.94 11.94 0 0 0 0 10.68l3.93-3.08z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.93 1.19 15.24 0 12 0 7.31 0 3.27 2.74 1.31 6.66L5.24 9.74c.95-2.88 3.61-5.01 6.76-5.01z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#3d271b]"></div>
                  <span className="flex-shrink mx-4 text-xs font-mono text-stone-500">OR PLAY AS GUEST</span>
                  <div className="flex-grow border-t border-[#3d271b]"></div>
                </div>

                {/* Guest Account Customization */}
                <form onSubmit={handleSaveGuestName} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">
                      Edit Guest Pilgrim Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-500" />
                      <input
                        type="text"
                        value={guestNameInput}
                        onChange={(e) => setGuestNameInput(e.target.value)}
                        placeholder="e.g. Timothy Scholar"
                        maxLength={18}
                        minLength={2}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all font-serif"
                      />
                    </div>
                  </div>

                  {successMsg && (
                    <p className="text-xs font-semibold text-emerald-400 text-center animate-bounce">
                      {successMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] text-[#0c0806] font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md hover:brightness-110 active:scale-98"
                  >
                    Save & Continue
                  </button>
                </form>

                <div className="p-3 bg-[#150d09] rounded-xl border border-[#3d271b] flex gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Guest stats are cached locally. Clearing your browser data will wipe progress. Connect to Google to secure your path indefinitely.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
