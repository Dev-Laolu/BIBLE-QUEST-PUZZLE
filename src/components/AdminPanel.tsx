import React, { useState } from "react";
import { useGame, LocalUserAccount } from "../context/GameContext";
import { 
  Shield, 
  Sparkles, 
  UserPlus, 
  Users, 
  ArrowLeft, 
  Ban, 
  CheckCircle, 
  Mail, 
  Key, 
  User, 
  Plus, 
  Award, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  Pencil, 
  X, 
  Filter, 
  Chrome, 
  Calendar, 
  Activity, 
  Database 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AdminPanel: React.FC = () => {
  const { 
    users, 
    adminAddUser, 
    adminToggleBanUser, 
    adminDeleteUser, 
    adminUpdateUser, 
    logOut 
  } = useGame();

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [authFilter, setAuthFilter] = useState<"all" | "google" | "email" | "banned">("all");

  // Create User States
  const [addMode, setAddMode] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [levelInput, setLevelInput] = useState(1);
  const [showEnrollPassword, setShowEnrollPassword] = useState(false);

  // Edit User States
  const [editingUser, setEditingUser] = useState<LocalUserAccount | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editLevel, setEditLevel] = useState(1);
  const [editXp, setEditXp] = useState(0);
  const [editGames, setEditGames] = useState(0);
  const [editHints, setEditHints] = useState(0);
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Actions & Feedbacks
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Statistics Calculation
  const totalPilgrims = users.length;
  const googlePilgrims = users.filter(u => u.isGoogleUser).length;
  const emailPilgrims = users.filter(u => !u.isGoogleUser).length;
  const bannedPilgrims = users.filter(u => u.isBanned).length;
  const totalXP = users.reduce((acc, u) => acc + (u.xp || 0), 0);
  const googlePercentage = totalPilgrims > 0 ? Math.round((googlePilgrims / totalPilgrims) * 100) : 0;

  // Filter & Search Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (authFilter === "google") return u.isGoogleUser;
    if (authFilter === "email") return !u.isGoogleUser;
    if (authFilter === "banned") return u.isBanned;
    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailInput || !usernameInput || !passwordInput) {
      setError("Please complete all requested registration details.");
      return;
    }

    const err = adminAddUser(emailInput, usernameInput, passwordInput, levelInput);
    if (err) {
      setError(err);
    } else {
      setSuccess(`Pilgrim ${usernameInput} enrolled successfully at initial level ${levelInput}!`);
      // Reset inputs
      setEmailInput("");
      setUsernameInput("");
      setPasswordInput("");
      setLevelInput(1);
      setAddMode(false);
    }
  };

  const startEditing = (u: LocalUserAccount) => {
    setEditingUser(u);
    setEditUsername(u.username);
    setEditLevel(u.level);
    setEditXp(u.xp);
    setEditGames(u.gamesPlayed);
    setEditHints(u.hintsUsed);
    setEditPassword(u.password || "");
    setShowEditPassword(false);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError(null);
    setSuccess(null);

    const updates: Partial<LocalUserAccount> = {
      username: editUsername,
      level: editLevel,
      xp: editXp,
      gamesPlayed: editGames,
      hintsUsed: editHints,
      password: editPassword,
    };

    const editError = await adminUpdateUser(editingUser.email, updates);
    if (editError) {
      setError(editError);
    } else {
      setSuccess(`Successfully updated the profile database details for ${editUsername}!`);
      setEditingUser(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + " " + d.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0806] text-[#e7e5e4] pb-12 font-sans">
      {/* Brand Header */}
      <header className="bg-[#1f130d] border-b border-[#3d271b] shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-red-950/40 border border-red-500/20 flex items-center justify-center text-red-400">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-red-400 leading-tight">
                Bible Quest Unified Admin Panel
              </h1>
              <span className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest leading-none">
                SANCTUM SECURITY & DATA HUB • ACCESSIBLE BY SECURE AUTHENTICATION ONLY
              </span>
            </div>
          </div>

          <button
            onClick={logOut}
            className="flex items-center gap-2 px-4 py-2 border border-stone-850 hover:border-red-500/30 text-stone-500 hover:text-red-400 text-xs font-mono font-semibold uppercase rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Admin Session
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Statistics Readouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Registered */}
          <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">Total Registered Pilgrims</span>
              <h3 className="text-3xl font-serif font-black text-[#d4af37] mt-1">{totalPilgrims}</h3>
              <p className="text-[10px] text-stone-500 mt-1 font-mono">
                {googlePilgrims} Google • {emailPilgrims} Email/Pass
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Google Oauth Breakdown */}
          <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">Google Auth Rate</span>
              <h3 className="text-3xl font-serif font-black text-blue-400 mt-1">{googlePercentage}%</h3>
              <p className="text-[10px] text-stone-500 mt-1 font-mono">
                {googlePilgrims} of {totalPilgrims} total accounts
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Chrome className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Banned Infractions status */}
          <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">Banned Accounts</span>
              <h3 className="text-3xl font-serif font-black text-rose-400 mt-1">{bannedPilgrims}</h3>
              <p className="text-[10px] text-stone-500 mt-1 font-mono">
                Restricted from gameplay sanctum
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-500/5 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Ban className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Holy Sanctum cumulative XP */}
          <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">Total Accumulated XP</span>
              <h3 className="text-3xl font-serif font-black text-emerald-400 mt-1">{totalXP.toLocaleString()}</h3>
              <p className="text-[10px] text-stone-500 mt-1 font-mono">
                Sum of overall fellowship progress
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-350 text-xs rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-950/30 text-emerald-350 text-xs rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {success}
          </div>
        )}

        {/* Database Control Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#150d09] border border-[#3d271b] p-4 rounded-2xl">
          {/* Query Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search via Pilgrim username / Email..."
              className="w-full pl-9 pr-4 py-2 bg-[#0c0806] border border-[#3d271b] text-stone-200 text-xs rounded-xl focus:border-[#d4af37] focus:outline-hidden font-mono"
            />
          </div>

          {/* Tab/Authentications Filters */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
            <button
              onClick={() => setAuthFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all border cursor-pointer ${
                authFilter === "all" 
                  ? "bg-[#3d271b] text-[#e7e5e4] border-[#d4af37]" 
                  : "bg-transparent border-stone-850 text-stone-400 hover:text-stone-300 hover:border-stone-800"
              }`}
            >
              All ({totalPilgrims})
            </button>
            <button
              onClick={() => setAuthFilter("google")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all border flex items-center gap-1 cursor-pointer ${
                authFilter === "google"
                  ? "bg-blue-950/30 text-blue-300 border-blue-500/40"
                  : "bg-transparent border-stone-850 text-stone-450 hover:text-blue-400"
              }`}
            >
              <Chrome className="w-3.5 h-3.5" />
              Google ({googlePilgrims})
            </button>
            <button
              onClick={() => setAuthFilter("email")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all border flex items-center gap-1 cursor-pointer ${
                authFilter === "email"
                  ? "bg-stone-900 text-stone-100 border-stone-700"
                  : "bg-transparent border-stone-850 text-stone-450 hover:text-stone-350"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email ({emailPilgrims})
            </button>
            <button
              onClick={() => setAuthFilter("banned")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all border flex items-center gap-1 cursor-pointer ${
                authFilter === "banned"
                  ? "bg-rose-950/20 text-rose-400 border-rose-500/30"
                  : "bg-transparent border-stone-850 text-stone-450 hover:text-rose-400"
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              Banned ({bannedPilgrims})
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-[#150d09] border border-[#3d271b] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-[#3d271b] bg-[#1a110c] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-serif font-bold text-lg text-stone-100">Pilgrim Database Table</h4>
              <p className="text-xs text-stone-400">
                Review user registration metadata, track level updates, modify account stats, and synchronize security status.
              </p>
            </div>

            <button
              onClick={() => {
                setAddMode(!addMode);
                setError(null);
                setSuccess(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] text-[#0c0806] font-bold text-xs font-mono uppercase rounded-xl transition-all hover:brightness-110"
            >
              <UserPlus className="w-4 h-4 text-[#0c0806]" />
              {addMode ? "Collapse Form" : "Enroll Pilgrim"}
            </button>
          </div>

          {/* Draw Enroll Pilgrim Form */}
          {addMode && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              onSubmit={handleCreateUser}
              className="p-6 bg-[#120a07] border-b border-[#3d271b] space-y-4"
            >
              <h5 className="text-xs text-[#d4af37] font-mono font-bold uppercase tracking-wider">
                Enroll New Player Credentials
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Pilgrim Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="pilgrim@faith.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#0c0806] border border-[#3d271b] text-xs text-stone-200 rounded-xl focus:border-[#d4af37] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Pilgrim Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type="text"
                      required
                      maxLength={18}
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="ScriptureSleuth"
                      className="w-full pl-9 pr-3 py-2 bg-[#0c0806] border border-[#3d271b] text-xs text-stone-200 rounded-xl focus:border-[#d4af37] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Initial Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                    <input
                      type={showEnrollPassword ? "text" : "password"}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="pass1234"
                      className="w-full pl-9 pr-10 py-2 bg-[#0c0806] border border-[#3d271b] text-xs text-stone-200 rounded-xl focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEnrollPassword(!showEnrollPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer bg-transparent border-0"
                    >
                      {showEnrollPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Commencing Level</label>
                  <select
                    value={levelInput}
                    onChange={(e) => setLevelInput(Number(e.target.value))}
                    className="w-full p-2 bg-[#0c0806] border border-[#3d271b] text-xs text-stone-200 rounded-xl focus:border-[#d4af37] focus:outline-hidden"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-800 to-emerald-600 text-stone-100 font-bold text-xs uppercase rounded-xl transition-all hover:brightness-110 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create pilgrim account
                </button>
              </div>
            </motion.form>
          )}

          {/* Users table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#1a110c]/80 border-b border-[#3d271b] text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  <th className="p-4">Pilgrim Ident</th>
                  <th className="p-4">Authorization</th>
                  <th className="p-4">Level & Stats</th>
                  <th className="p-4">Dates & Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3d271b]/45 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-stone-500 font-mono text-xs">
                      No matching pilgrim accounts discovered in the database under current filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.email} className={`hover:bg-[#1a110c]/30 transition-all ${u.isBanned ? "opacity-60 bg-red-950/10" : ""}`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img 
                              src={u.photoURL} 
                              alt={u.username} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border border-[#d4af37]/35 object-cover" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#2d1b14] border border-[#3d271b] flex items-center justify-center text-[#d4af37] font-serif font-black text-sm">
                              {u.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-stone-100 block">{u.username}</span>
                              {u.emailVerified && (
                                <span className="text-blue-400" title="Email Verified via Auth Provider">
                                  <CheckCircle className="w-3.5 h-3.5 fill-blue-500/10" />
                                </span>
                              )}
                            </div>
                            <span className="block text-xs font-mono text-stone-450">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            u.isGoogleUser 
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                            {u.isGoogleUser ? <Chrome className="w-2.5 h-2.5" /> : <Mail className="w-2.5 h-2.5" />}
                            {u.isGoogleUser ? "Google Auth" : "Email / Pass"}
                          </span>
                          {!u.isGoogleUser && u.password && (
                            <div className="text-[10px] font-mono text-stone-500 flex items-center gap-1">
                              <span>Password:</span>
                              <span className="text-amber-200 hover:text-amber-150 cursor-pointer select-all font-bold">
                                {u.password}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-xs font-mono">
                        <div className="space-y-1 text-stone-300">
                          <div className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-[#d4af37]" />
                            <span className="font-bold text-[#d4af37]">Level {u.level || 1}</span>
                          </div>
                          <div>XP: <span className="font-bold text-stone-200">{u.xp || 0}</span></div>
                          <div className="text-[10px] text-stone-450">
                            Games: <span className="text-stone-300">{u.gamesPlayed || 0}</span> • Hints: <span className="text-stone-300">{u.hintsUsed || 0}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs font-mono text-stone-450 space-y-1">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-stone-500">Created:</span>{" "}
                          <span className="text-stone-300">{formatDate(u.creationTime)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-stone-500">Last SeId:</span>{" "}
                          <span className="text-stone-300">{formatDate(u.lastSignInTime)}</span>
                        </div>
                        {u.isBanned && (
                          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-red-950 text-red-400 border border-red-900/40 text-[9px] font-bold">
                            RESTRICTED / BANNED
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex gap-2">
                          {deleteConfirmEmail === u.email ? (
                            <div className="flex items-center gap-1.5 bg-[#25120e] border border-red-900/45 p-1.5 rounded-xl">
                              <span className="text-[9px] font-bold text-red-400 uppercase font-mono px-1">Verify deletion?</span>
                              <button
                                onClick={() => {
                                  adminDeleteUser(u.email);
                                  setDeleteConfirmEmail(null);
                                  setSuccess(`Successfully deleted ${u.username} database profile.`);
                                }}
                                className="px-2 py-1 text-[10px] font-mono font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all cursor-pointer"
                              >
                                CONFIRM
                              </button>
                              <button
                                onClick={() => setDeleteConfirmEmail(null)}
                                className="px-2 py-1 text-[10px] font-mono font-bold bg-[#1d1613] hover:bg-[#2d1f1b] text-stone-400 rounded-lg transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Edit Stats Button */}
                              <button
                                onClick={() => startEditing(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-stone-800 text-stone-300 hover:text-[#d4af37] hover:border-[#d4af37]/35 transition-all cursor-pointer"
                                title="Edit game stats and passwords"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </button>

                              {/* Toggle Ban Button */}
                              <button
                                onClick={() => {
                                  adminToggleBanUser(u.email);
                                  setSuccess(`Updated security status for pilgrim ${u.username}.`);
                                }}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-lg transition-all border cursor-pointer
                                  ${u.isBanned
                                    ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:bg-[#1a2d1e]"
                                    : "bg-red-950/20 border-red-900/40 text-red-400 hover:bg-[#2d1a1b]"
                                  }
                                `}
                              >
                                <Ban className="w-3 h-3" />
                                {u.isBanned ? "Unban" : "Ban"}
                              </button>

                              {/* Delete Profile Button */}
                              <button
                                onClick={() => {
                                  setDeleteConfirmEmail(u.email);
                                  setError(null);
                                  setSuccess(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-lg bg-red-950/20 border border-red-900/30 text-red-300 hover:bg-red-950/50 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit User Floating Modal Dialog */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#150d09] border border-[#3d271b] max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 relative"
            >
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="absolute right-4 top-4 text-stone-500 hover:text-stone-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-lg font-serif font-black text-[#d4af37]">
                  Edit pilgrim database values
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                You are fine-tuning profile properties for <span className="font-bold text-stone-200">{editingUser.email}</span>. Updates will synchronize automatically.
              </p>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Username</label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0c0806] border border-[#3d271b] text-stone-100 text-xs rounded-xl focus:border-[#d4af37] focus:outline-hidden"
                  />
                </div>

                {/* Level selection & XP */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Commencing Level</label>
                    <select
                      value={editLevel}
                      onChange={(e) => setEditLevel(Number(e.target.value))}
                      className="w-full p-2 bg-[#0c0806] border border-[#3d271b] text-xs text-stone-100 rounded-xl focus:border-[#d4af37] focus:outline-hidden"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Total XP Score</label>
                    <input
                      type="number"
                      min={0}
                      value={editXp}
                      onChange={(e) => setEditXp(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0c0806] border border-[#3d271b] text-stone-100 text-xs rounded-xl focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Games Played & Hints Used */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Games Played</label>
                    <input
                      type="number"
                      min={0}
                      value={editGames}
                      onChange={(e) => setEditGames(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0c0806] border border-[#3d271b] text-stone-100 text-xs rounded-xl focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Hints Used</label>
                    <input
                      type="number"
                      min={0}
                      value={editHints}
                      onChange={(e) => setEditHints(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#0c0806] border border-[#3d271b] text-stone-100 text-xs rounded-xl focus:border-[#d4af37] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Custom Password Credentials adjustment (Only visible/active if they are not Google Oauth accounts) */}
                {!editingUser.isGoogleUser ? (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">Password Credentials Adjustment</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="New Password"
                        className="w-full pl-3 pr-10 py-2 bg-[#0c0806] border border-[#3d271b] text-stone-150 text-xs rounded-xl focus:border-[#d4af37] focus:outline-hidden font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer bg-transparent border-0"
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-stone-500 italic">
                    Password overrides are disabled for Google Federation accounts.
                  </p>
                )}

                {/* Buttons controls */}
                <div className="flex justify-end gap-2 pt-2 border-t border-[#3d271b]">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-stone-250 bg-[#150d09] border border-[#3d271b] rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-[#0c0806] bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] rounded-xl cursor-pointer hover:brightness-110"
                  >
                    Save database changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
