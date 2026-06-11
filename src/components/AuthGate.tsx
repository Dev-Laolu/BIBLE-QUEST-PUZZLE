import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { BookOpen, Sparkles, Mail, Lock, User, Key, ArrowRight, ShieldAlert, AlertCircle, RefreshCw, LogIn, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AuthGate: React.FC = () => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, forgetPasswordGenerateCode, resetPasswordWithCode, adminLogin } = useGame();

  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset" | "admin">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Error & Status States
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOfflineCode, setGeneratedOfflineCode] = useState<string | null>(null);

  // Admin login credentials
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const resetStates = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();

    if (!email || !username || !password || !confirmPassword) {
      setError("Please fill in all requested fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const err = await signUpWithEmail(email, username, password);
      if (err) {
        setError(err);
      } else {
        setSuccess("Account established! Preparing your Pilgrim journey...");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();

    if (!email || !password) {
      setError("Please specify both email/username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const err = await signInWithEmail(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccess("Authenticating your entry...");
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgetTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgetPasswordGenerateCode(email);
      if (res.success && res.code) {
        setGeneratedOfflineCode(res.code);
        setSuccess(`Verification code generated: ${res.code}. Enter this code below to set a new password!`);
        setMode("reset");
      } else {
        setError(res.error || "No account found matching this email.");
      }
    } catch (e: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();

    if (!code || !password) {
      setError("Please provide the code along with your new password.");
      return;
    }
    if (password.length < 6) {
      setError("Your new password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const ok = await resetPasswordWithCode(email, code, password);
      if (ok) {
        setSuccess("Success! Code verified. Your password has been updated and you are now signed in.");
      } else {
        setError("Invalid or expired verification code. Please check and try again.");
      }
    } catch {
      setError("An unexpected error occurred resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    resetStates();

    if (!adminUser || !adminPass) {
      setError("Admin credentials must be provided.");
      return;
    }

    const ok = adminLogin(adminUser, adminPass);
    if (ok) {
      setSuccess("Authenticating staff portal...");
    } else {
      setError("Invalid administrative credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0806] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual Ambiance Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,27,20,0.4)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#150d09] border border-[#3d271b] rounded-3xl overflow-hidden p-6 sm:p-8 space-y-6 shadow-[0_0_35px_rgba(138,109,26,0.1)] relative z-10"
      >
        {/* Brand Title Area */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#8a6d1a] flex items-center justify-center text-[#0c0806] mx-auto shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:rotate-6 transition-transform">
            <BookOpen className="w-7 h-7 stroke-2" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#d4af37]">
              Bible Quest
            </h2>
            <p className="text-[10px] font-extrabold uppercase font-mono tracking-widest text-stone-500">
              Scripture Word Search
            </p>
          </div>
        </div>

        {/* Dynamic Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl flex items-start gap-2 text-rose-350 text-xs"
            >
              <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-950/25 border border-emerald-900/30 p-3 rounded-xl flex items-start gap-2 text-emerald-350 text-xs"
            >
              <Sparkles className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Core Forms Area */}
        {mode === "login" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Email or Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email or username"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetStates();
                      setMode("forgot");
                    }}
                    className="text-[10px] font-semibold text-[#d4af37] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] text-[#0c0806] font-bold py-2.5 px-4 rounded-xl text-sm hover:brightness-110 active:scale-98 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 pointer-events-auto"
            >
              {isLoading ? "Authenticating..." : "Sign In to Quest"}
              <ArrowRight className="w-4 h-4 text-[#0c0806]" />
            </button>

            <div className="text-center">
              <span className="text-xs text-stone-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    resetStates();
                    setMode("signup");
                  }}
                  className="text-[#d4af37] font-semibold hover:underline"
                >
                  Create Account
                </button>
              </span>
            </div>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Timothy Scholar"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Confirm Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] text-[#0c0806] font-bold py-2.5 px-4 rounded-xl text-sm hover:brightness-110 active:scale-98 transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] disabled:opacity-50 pointer-events-auto"
            >
              {isLoading ? "Enrolling..." : "Create Free Account"}
              <ArrowRight className="w-4 h-4 text-[#0c0806]" />
            </button>

            <div className="text-center">
              <span className="text-xs text-stone-500">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    resetStates();
                    setMode("login");
                  }}
                  className="text-[#d4af37] font-semibold hover:underline"
                >
                  Sign In
                </button>
              </span>
            </div>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgetTrigger} className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-base text-stone-200">
                Recover Account Password
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Enter your registered pilgrim email. A secure verification code will be output to authorize your password renewal.
              </p>
            </div>

            <div className="space-y-1/2">
              <label className="block text-[10px] font-bold text-stone-400 tracking-wider uppercase font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2d1b14] border border-[#4a2e23] hover:bg-[#3d271b] text-[#d4af37] font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-98"
            >
              {isLoading ? "Retrieving..." : "Generate Verification Code"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  resetStates();
                  setMode("login");
                }}
                className="text-xs text-stone-400 hover:text-[#d4af37] underline"
              >
                Back To Login
              </button>
            </div>
          </form>
        )}

        {mode === "reset" && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-stone-200">
                Commit New Password
              </h3>
              <p className="text-xs text-[#d4af37] leading-relaxed">
                Please enter the verification code that was generated for you.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  6-Digit Reset Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter dispatch code"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 font-mono tracking-widest text-[#d4af37] rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  New Secret Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type new secure password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-100 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] text-[#0c0806] font-bold py-2.5 rounded-xl text-sm transition-all shadow-md hover:brightness-110 active:scale-98"
            >
              Verify Code & Update Password
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  resetStates();
                  setMode("login");
                }}
                className="text-xs text-stone-450 hover:text-[#d4af37] underline"
              >
                Cancel reset
              </button>
            </div>
          </form>
        )}

        {mode === "admin" && (
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="space-y-1 text-center">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono tracking-widest uppercase font-bold">
                🔒 RESTRICTED STAFF DOORway
              </span>
              <p className="text-xs text-stone-400 leading-relaxed mt-2.5">
                Authenticating requires the authorized administrative credentials.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Staff Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    placeholder="Username"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-200 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Administrative Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    required
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="Administrative Password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0c0806] border border-[#3d271b] focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/25 text-stone-200 rounded-xl text-sm focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#d4af37] cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-800 to-red-650 text-white font-bold py-2.5 rounded-xl text-sm transition-all hover:brightness-110 active:scale-98 shadow-md"
            >
              Enter Administration
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  resetStates();
                  setMode("login");
                }}
                className="text-xs text-stone-400 hover:text-stone-200 underline"
              >
                Return to Standard Login
              </button>
            </div>
          </form>
        )}

        {/* Global Google Authenticator */}
        {mode !== "admin" && (
          <div className="space-y-4 pt-1 border-t border-[#3d271b]/60">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#3d271b]/40 h-[1px]" />
              <span className="relative px-3 bg-[#150d09] text-[9px] font-bold font-mono text-stone-500 uppercase tracking-widest">
                Third-Party Portal
              </span>
            </div>

            <button
              onClick={signInWithGoogle}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#0a0604] border border-[#3d271b] hover:bg-[#1f130d] rounded-xl font-bold text-stone-300 text-xs transition-all shadow-inner active:scale-98 pointer-events-auto cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
              Sign In with Google
            </button>
          </div>
        )}

        {/* Local Caching Disclaimer */}
        <div className="flex items-start gap-2 p-3 bg-[#0a0604] border border-[#3d271b]/60 rounded-2xl">
          <ShieldAlert className="w-4.5 h-4.5 text-[#d4af37] shrink-0 mt-0.5" />
          <p className="text-[10px] text-stone-500 leading-relaxed font-sans">
            Pilglrim parameters are encrypted and compiled locally. The system can function entirely offline when connection signals fade.
          </p>
        </div>

        {/* Small Hidden Admin Entrance */}
        <div className="text-center pt-2">
          {mode !== "admin" ? (
            <button
              onClick={() => {
                resetStates();
                setMode("admin");
              }}
              className="text-[10px] font-mono text-stone-600 hover:text-stone-400 uppercase tracking-widest cursor-pointer transition-all"
            >
              🔐 Administrator Portal
            </button>
          ) : (
            <button
              onClick={() => {
                resetStates();
                setMode("login");
              }}
              className="text-[10px] font-mono text-stone-600 hover:text-stone-400 uppercase tracking-widest cursor-pointer transition-all"
            >
              👨‍💻 Standard Pilgrim Gateway
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
