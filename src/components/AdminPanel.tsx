import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { Shield, Sparkles, UserPlus, Users, ArrowLeft, Ban, CheckCircle, Mail, Key, User, Plus, Award, Eye, EyeOff, Trash2 } from "lucide-react";
import { motion } from "motion/react";

export const AdminPanel: React.FC = () => {
  const { users, adminAddUser, adminToggleBanUser, adminDeleteUser, logOut } = useGame();

  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [levelInput, setLevelInput] = useState(1);
  const [showEnrollPassword, setShowEnrollPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-[#0c0806] text-[#e7e5e4] pb-12">
      {/* Mini Brand Header */}
      <header className="bg-[#1f130d] border-b border-[#3d271b] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-red-950/40 border border-red-500/20 flex items-center justify-center text-red-400">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-red-400 leading-tight">
                Bible Quest Admin
              </h1>
              <span className="block text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest leading-none">
                SANCTUM SECURITY PANEL
              </span>
            </div>
          </div>

          <button
            onClick={logOut}
            className="flex items-center gap-2 px-4 py-2 border border-stone-800 hover:border-red-500/30 text-stone-500 hover:text-red-400 text-xs font-mono font-semibold uppercase rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Admin Session
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Statistics Readouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">Total Registered Pilgrims</span>
              <h3 className="text-3xl font-serif font-black text-[#d4af37] mt-1">{users.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#d4af37]/5 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">Active Servers</span>
              <h3 className="text-3xl font-serif font-black text-rose-400 mt-1">1 Offline</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-rose-500/5 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Shield className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-2xl flex items-center justify-between sm:grid-cols-2 md:col-span-1">
            <div>
              <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest font-bold">Sanctum Status</span>
              <h3 className="text-3x1 font-serif font-black text-emerald-400 mt-1 text-2xl font-bold">Guarded</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-300 text-xs rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-950/30 text-emerald-300 text-xs rounded-xl">
            {success}
          </div>
        )}

        {/* Content Box */}
        <div className="bg-[#150d09] border border-[#3d271b] rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-[#3d271b] bg-[#1a110c] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="font-serif font-bold text-lg text-stone-100">Pilgrim Database Table</h4>
              <p className="text-xs text-stone-400">Review status, monitor level expansion progress, ban infraction targets, or add new participants.</p>
            </div>

            <button
              onClick={() => setAddMode(!addMode)}
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
                      className="w-full pl-9 pr-10 py-2 bg-[#0c0806] border border-[#3d271b] text-xs text-stone-200 rounded-xl focus:border-[#d4af37] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEnrollPassword(!showEnrollPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer animate-none bg-transparent border-0"
                    >
                      {showEnrollPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">Commencing Level (1-12)</label>
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a110c]/80 border-b border-[#3d271b] text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                  <th className="p-4">Pilgrim Name</th>
                  <th className="p-4">User Email</th>
                  <th className="p-4">Level Reach</th>
                  <th className="p-4">Total XP</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3d271b]/45 text-sm">
                {users.map((u) => (
                  <tr key={u.email} className={`hover:bg-[#1a110c]/30 transition-all ${u.isBanned ? "opacity-60 bg-red-950/5" : ""}`}>
                    <td className="p-4 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2d1b14] border border-[#3d271b] flex items-center justify-center text-[#d4af37] font-semibold text-xs">
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold block text-stone-200">{u.username}</span>
                        {u.isBanned && (
                          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-red-950 text-red-400 border border-red-900/40 text-[9px] font-mono font-bold mt-0.5">
                            BANNED
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-stone-400">{u.email}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-[#d4af37]" />
                        <span className="font-bold text-stone-200">Level {u.level}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs font-bold text-[#d4af37]">{u.xp} XP</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${u.isGoogleUser ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-[#2d1b14] text-stone-400 border-[#3d271b]"}`}>
                        {u.isGoogleUser ? "Google" : "Email/Pass"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-2">
                        {deleteConfirmEmail === u.email ? (
                          <div className="flex items-center gap-1.5 bg-[#25120e] border border-red-900/40 p-1.5 rounded-xl">
                            <span className="text-[10px] font-bold text-red-400 uppercase font-mono px-1">Confirm Delete?</span>
                            <button
                              onClick={() => {
                                adminDeleteUser(u.email);
                                setDeleteConfirmEmail(null);
                              }}
                              className="px-2 py-1 text-[10px] font-mono font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmEmail(null)}
                              className="px-2 py-1 text-[10px] font-mono font-bold bg-[#1d1613] hover:bg-[#2d1f1b] text-stone-400 rounded-lg transition-all cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => adminToggleBanUser(u.email)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-pointer
                                ${u.isBanned
                                  ? "bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/40"
                                  : "bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-950/45"
                                }
                              `}
                            >
                              <Ban className="w-3.5 h-3.5" />
                              {u.isBanned ? "Unban" : "Ban"}
                            </button>

                            <button
                              onClick={() => setDeleteConfirmEmail(u.email)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-xl bg-red-950/30 border border-red-900/40 text-red-300 hover:bg-red-950 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
