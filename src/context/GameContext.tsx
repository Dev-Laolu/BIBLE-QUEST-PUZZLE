import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { UserProfile, LeaderboardEntry, CommunityActivity, BibleTheme } from "../types";
import { BIBLE_THEMES } from "../bibleThemes";

export interface LocalUserAccount {
  email: string;
  username: string;
  password?: string;
  level: number;
  xp: number;
  gamesPlayed: number;
  hintsUsed: number;
  isBanned: boolean;
  isGoogleUser: boolean;
}

interface GameContextType {
  // Authentication & Profile States
  user: any | null; // Can be Firebase User or LocalUserAccount
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  guestProfile: UserProfile;
  isAdmin: boolean;

  // Real Email/Password Auth & Google Auth Methods
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, username: string, pass: string) => Promise<string | null>;
  signInWithEmail: (email: string, pass: string) => Promise<string | null>;
  forgetPasswordGenerateCode: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  resetPasswordWithCode: (email: string, code: string, newPass: string) => Promise<boolean>;
  logOut: () => Promise<void>;
  setGuestUsername: (name: string) => void;

  // Admin Portal Operations
  adminLogin: (username: string, pass: string) => boolean;
  adminAddUser: (email: string, username: string, pass: string, startLevel: number) => string | null;
  adminToggleBanUser: (email: string) => void;
  adminDeleteUser: (email: string) => void;
  getAllUsers: () => LocalUserAccount[];
  users: LocalUserAccount[];

  // Game Progress Synchronization
  updateProgress: (wordsFound: number, hintsUsed: number, levelsPassed: number) => Promise<void>;
  submitLeaderboardScore: (score: number, level: number, hintsUsed: number) => Promise<void>;

  // Interactive Live Feed & Leaderboards
  activities: CommunityActivity[];
  leaderboard: LeaderboardEntry[];
  currentDayId: string;
  refreshLeaderboard: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Get current date string for daily leaderboard index (e.g. "2026-06-11")
function getTodayId() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEFAULT_GUEST_PROFILE: UserProfile = {
  username: "Seeker Guest",
  level: 1,
  xp: 0,
  gamesPlayed: 0,
  hintsUsed: 0,
  lastActive: new Date().toISOString(),
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [guestProfile, setGuestProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("bible_quest_guest");
    return saved ? JSON.parse(saved) : DEFAULT_GUEST_PROFILE;
  });
  const [isGuest, setIsGuest] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Recovery Codes Storage
  const [recoveryCodes, setRecoveryCodes] = useState<Record<string, string>>({});

  // Local Accounts Database for complete 100% offline-playable support
  const [localAccounts, setLocalAccounts] = useState<LocalUserAccount[]>(() => {
    const saved = localStorage.getItem("bible_quest_accounts");
    return saved ? JSON.parse(saved) : [
      {
        email: "pilgrim_one@quest.com",
        username: "Faithful Scholar",
        password: "password123",
        level: 3,
        xp: 1540,
        gamesPlayed: 14,
        hintsUsed: 3,
        isBanned: false,
        isGoogleUser: false
      }
    ];
  });

  const localAccountsRef = useRef<LocalUserAccount[]>(localAccounts);

  // Synchronize localAccounts with its reference
  useEffect(() => {
    localAccountsRef.current = localAccounts;
  }, [localAccounts]);

  const [activities, setActivities] = useState<CommunityActivity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const currentDayId = getTodayId();

  // Save guest and local database accounts whenever they are mutated
  useEffect(() => {
    localStorage.setItem("bible_quest_accounts", JSON.stringify(localAccounts));
  }, [localAccounts]);

  useEffect(() => {
    if (isGuest && !user) {
      localStorage.setItem("bible_quest_guest", JSON.stringify(guestProfile));
    }
  }, [guestProfile, isGuest, user]);

  // Attempt to restore persistent session from local storage on bootstrap
  useEffect(() => {
    const runBootSession = async () => {
      // 1. Check if an admin was logged in
      const savedAdminSession = localStorage.getItem("bible_quest_admin_session");
      if (savedAdminSession === "true") {
        setIsAdmin(true);
        setIsGuest(false);
        setLoading(false);
        return;
      }

      // 2. Check if a standard user session exists
      const savedSessionEmail = localStorage.getItem("bible_quest_session_email");
      if (savedSessionEmail) {
        const found = localAccounts.find((acc) => acc.email.toLowerCase() === savedSessionEmail.toLowerCase());
        if (found) {
          if (found.isBanned) {
            localStorage.removeItem("bible_quest_session_email");
          } else {
            setUser({ email: found.email, uid: found.email, displayName: found.username });
            setProfile({
              username: found.username,
              level: found.level,
              xp: found.xp,
              gamesPlayed: found.gamesPlayed,
              hintsUsed: found.hintsUsed,
              lastActive: new Date().toISOString(),
            });
            setIsGuest(false);
            setLoading(false);
            return;
          }
        }
      }

      // 3. Fallback to default firebase auth listener check
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const emailString = (currentUser.email || `${currentUser.uid}@google.com`).toLowerCase();
          const existingLocal = localAccountsRef.current.find(a => a.email.toLowerCase() === emailString);
          if (existingLocal && existingLocal.isBanned) {
            signOut(auth);
            localStorage.removeItem("bible_quest_session_email");
            setUser(null);
            setProfile(null);
            setIsGuest(true);
            setLoading(false);
            return;
          }

          setIsGuest(false);
          setIsAdmin(false);
          const userRef = doc(db, "users", currentUser.uid);
          try {
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const cloudProf = snap.data() as UserProfile;
              setProfile(cloudProf);
              setUser(currentUser);

              // Update local registry cache too
              setLocalAccounts(prev => {
                const existing = prev.find(a => a.email.toLowerCase() === currentUser.email?.toLowerCase());
                const wasBanned = existing ? existing.isBanned : false;
                const filtered = prev.filter(a => a.email.toLowerCase() !== currentUser.email?.toLowerCase());
                return [
                  ...filtered,
                  {
                    email: currentUser.email || `${currentUser.uid}@google.com`,
                    username: cloudProf.username,
                    level: cloudProf.level,
                    xp: cloudProf.xp,
                    gamesPlayed: cloudProf.gamesPlayed,
                    hintsUsed: cloudProf.hintsUsed,
                    isBanned: wasBanned,
                    isGoogleUser: true,
                  }
                ];
              });
            } else {
              // Create default cloud record
              const defaultName = currentUser.displayName || `Believer_${currentUser.uid.slice(0, 5)}`;
              const cleanName = defaultName.slice(0, 20).replace(/[^a-zA-Z0-9_\s]/g, "");
              const newProfile: UserProfile = {
                username: cleanName || "Faithful Scholar",
                level: 1,
                xp: 0,
                gamesPlayed: 0,
                hintsUsed: 0,
                lastActive: serverTimestamp(),
              };
              await setDoc(userRef, newProfile);
              setProfile(newProfile);
              setUser(currentUser);

              // Save in local too
              setLocalAccounts(prev => {
                const existing = prev.find(a => a.email.toLowerCase() === currentUser.email?.toLowerCase());
                const wasBanned = existing ? existing.isBanned : false;
                const filtered = prev.filter(a => a.email.toLowerCase() !== currentUser.email?.toLowerCase());
                return [
                  ...filtered,
                  {
                    email: currentUser.email || `${currentUser.uid}@google.com`,
                    username: newProfile.username,
                    level: newProfile.level,
                    xp: newProfile.xp,
                    gamesPlayed: newProfile.gamesPlayed,
                    hintsUsed: newProfile.hintsUsed,
                    isBanned: wasBanned,
                    isGoogleUser: true,
                  }
                ];
              });

              await logAchievement(currentUser.uid, newProfile.username, "joined the fellowship and commenced their Pilgrimage!");
            }
          } catch (err) {
            console.warn("Cloud connection limited or blocked. Using local accounts context.");
            // Offline representation mapping
            const email = currentUser.email || `${currentUser.uid}@google.com`;
            const cachedAcc = localAccountsRef.current.find(a => a.email.toLowerCase() === email.toLowerCase());
            if (cachedAcc) {
              setProfile({
                username: cachedAcc.username,
                level: cachedAcc.level,
                xp: cachedAcc.xp,
                gamesPlayed: cachedAcc.gamesPlayed,
                hintsUsed: cachedAcc.hintsUsed,
                lastActive: new Date().toISOString(),
              });
            } else {
              const offlineProfile = {
                username: currentUser.displayName || "Faithful Scholar",
                level: 1,
                xp: 0,
                gamesPlayed: 0,
                hintsUsed: 0,
                lastActive: new Date().toISOString()
              };
              setProfile(offlineProfile);
            }
            setUser(currentUser);
          }
        } else {
          // Keep guest or wait
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    runBootSession();
  }, []);

  // Real-time listener for profile sync (when online)
  useEffect(() => {
    if (!user || isAdmin || isGuest || user.uid === user.email) return;
    const userRef = doc(db, "users", user.uid);
    try {
      const snapUnsub = onSnapshot(
        userRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setProfile(snapshot.data() as UserProfile);
          }
        },
        (error) => {
          console.warn("Real-time profile listener restricted. Operating offline model.");
        }
      );
      return () => snapUnsub();
    } catch {
      // Ignored for offline gracefulness
    }
  }, [user, isAdmin, isGuest]);

  // Unified listeners for Timeline Achievements Scroll (Network-Resilient)
  useEffect(() => {
    if (isGuest && !user) {
      setActivities([
        {
          id: "act-1",
          userId: "system",
          username: "Archangel",
          text: "unlocked Level 12 on 'The Apostles & Gospels'!",
          timestamp: new Date(Date.now() - 30000).toISOString(),
        },
        {
          id: "act-2",
          userId: "system",
          username: "ScriptureSolver",
          text: "completed 'Daniel in Babylon' with no hints!",
          timestamp: new Date(Date.now() - 1700000).toISOString(),
        },
        {
          id: "act-3",
          userId: "system",
          username: "FaithFeat",
          text: "forged a record score of 980 points in daily arena!",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        }
      ]);
      return;
    }

    try {
      const actRef = collection(db, "activities");
      const q = query(actRef, orderBy("timestamp", "desc"), limit(20));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: CommunityActivity[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              userId: data.userId,
              username: data.username,
              text: data.text,
              timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp,
            });
          });
          setActivities(list);
        },
        (error) => {
          // Silent fallback to standard mock achievements list
          setActivities([
            {
              id: "offline-1",
              userId: "offline",
              username: "Local Pilgrim",
              text: "completed a local Bible puzzle run successfully!",
              timestamp: new Date().toISOString(),
            },
            {
              id: "act-2",
              userId: "system",
              username: "ScriptureSolver",
              text: "completed 'Daniel in Babylon' with no hints!",
              timestamp: new Date(Date.now() - 1700000).toISOString(),
            }
          ]);
        }
      );
      return () => unsub();
    } catch {
      // Offline fallback
    }
  }, [user, isGuest]);

  // Daily Leaderboard Listener (Network-Resilient)
  useEffect(() => {
    if (isGuest && !user) {
      setLeaderboard([
        {
          userId: "m-1",
          username: "DavidSlayer",
          score: 850,
          level: 5,
          hintsUsed: 0,
          completedAt: new Date().toISOString(),
        },
        {
          userId: "m-2",
          username: "EstherQueen",
          score: 720,
          level: 4,
          hintsUsed: 1,
          completedAt: new Date(Date.now() - 250000).toISOString(),
        },
        {
          userId: "m-3",
          username: "RuthFaithful",
          score: 510,
          level: 3,
          hintsUsed: 0,
          completedAt: new Date(Date.now() - 1200000).toISOString(),
        }
      ]);
      return;
    }

    try {
      const leaderboardPath = `leaderboards/${currentDayId}/scores`;
      const scoreRef = collection(db, leaderboardPath);
      const q = query(scoreRef, orderBy("score", "desc"), limit(15));
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          const list: LeaderboardEntry[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              userId: data.userId,
              username: data.username,
              score: data.score,
              level: data.level,
              hintsUsed: data.hintsUsed,
              completedAt: data.completedAt?.toDate ? data.completedAt.toDate().toISOString() : data.completedAt,
            });
          });
          setLeaderboard(list);
        },
        (error) => {
          // Dynamic offline mock merging any scores
          setLeaderboard([
            {
              userId: "m-1",
              username: "DavidSlayer",
              score: 850,
              level: 5,
              hintsUsed: 0,
              completedAt: new Date().toISOString(),
            },
            {
              userId: "m-2",
              username: "EstherQueen",
              score: 720,
              level: 4,
              hintsUsed: 1,
              completedAt: new Date(Date.now() - 250000).toISOString(),
            }
          ]);
        }
      );
      return () => unsub();
    } catch {
      // Offline fallback auto-handled
    }
  }, [user, isGuest, currentDayId]);

  // Sync actions to cloud timeline
  const logAchievement = async (uid: string, uname: string, text: string) => {
    try {
      const actDocRef = doc(collection(db, "activities"));
      await setDoc(actDocRef, {
        userId: uid,
        username: uname,
        text: text,
        timestamp: serverTimestamp(),
      });
    } catch {
      // Handled silently
    }
  };

  // 1. Google Auth Sign-In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const response = await signInWithPopup(auth, provider);
      if (response && response.user) {
        const u = response.user;
        setUser(u);
        setIsGuest(false);
        setIsAdmin(false);
        localStorage.setItem("bible_quest_session_email", u.email || "");
      }
    } catch (err) {
      console.error("Google Auth failed: ", err);
    }
  };

  // 2. Email Sign-Up
  const signUpWithEmail = async (email: string, username: string, pass: string): Promise<string | null> => {
    const normEmail = email.trim().toLowerCase();
    const cleanUName = username.trim();

    if (localAccounts.some(acc => acc.email.toLowerCase() === normEmail)) {
      return "An account with this email already exists.";
    }
    if (localAccounts.some(acc => acc.username.toLowerCase() === cleanUName.toLowerCase())) {
      return "An account with this username already exists.";
    }

    const newAcc: LocalUserAccount = {
      email: normEmail,
      username: cleanUName,
      password: pass,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      hintsUsed: 0,
      isBanned: false,
      isGoogleUser: false
    };

    // Update state and persistent cache
    setLocalAccounts(prev => [...prev, newAcc]);
    setUser({ email: normEmail, uid: normEmail, displayName: cleanUName });
    setProfile({
      username: cleanUName,
      level: 1,
      xp: 0,
      gamesPlayed: 0,
      hintsUsed: 0,
      lastActive: new Date().toISOString(),
    });
    setIsGuest(false);
    setIsAdmin(false);
    localStorage.setItem("bible_quest_session_email", normEmail);

    // Sync to cloud in parallel background (safely ignored if offline)
    try {
      const uRef = doc(db, "users", normEmail);
      await setDoc(uRef, {
        username: cleanUName,
        level: 1,
        xp: 0,
        gamesPlayed: 0,
        hintsUsed: 0,
        lastActive: serverTimestamp()
      });
      await logAchievement(normEmail, cleanUName, "created their Pilgrim Account and started searching Scripture!");
    } catch {
      // Ignored if offline
    }

    return null; // success
  };

  // 3. Email Sign-In
  const signInWithEmail = async (identifier: string, pass: string): Promise<string | null> => {
    const cleanId = identifier.trim().toLowerCase();
    const foundAcc = localAccounts.find(acc => 
      acc.email.toLowerCase() === cleanId || 
      acc.username.toLowerCase() === cleanId
    );

    if (!foundAcc) {
      return "Incorrect email/username or password. Please verify your credentials.";
    }
    if (foundAcc.password !== pass) {
      return "Incorrect email/username or password. Please verify your credentials.";
    }
    if (foundAcc.isBanned) {
      return "This pilgrim account has been BANNED by the Administrator.";
    }

    // Set active login states
    setUser({ email: foundAcc.email, uid: foundAcc.email, displayName: foundAcc.username });
    setProfile({
      username: foundAcc.username,
      level: foundAcc.level,
      xp: foundAcc.xp,
      gamesPlayed: foundAcc.gamesPlayed,
      hintsUsed: foundAcc.hintsUsed,
      lastActive: new Date().toISOString(),
    });
    setIsGuest(false);
    setIsAdmin(false);
    localStorage.setItem("bible_quest_session_email", foundAcc.email);

    return null; // Success
  };

  // 4. Password Recovery / Forget password trigger
  const forgetPasswordGenerateCode = async (email: string) => {
    const normEmail = email.trim().toLowerCase();
    const foundAcc = localAccounts.find(acc => acc.email.toLowerCase() === normEmail);

    if (!foundAcc) {
      return { success: false, error: "No pilgrim account discovered with this email." };
    }

    // Generate random 6-digit verification code
    const generatedCode = String(Math.floor(100000 + Math.random() * 900000)); // 100000 to 999999
    setRecoveryCodes(prev => ({ ...prev, [normEmail]: generatedCode }));

    return { success: true, code: generatedCode };
  };

  // 5. Reset Password using Code
  const resetPasswordWithCode = async (email: string, code: string, newPass: string): Promise<boolean> => {
    const normEmail = email.trim().toLowerCase();
    const cachedCode = recoveryCodes[normEmail];

    if (cachedCode && cachedCode === code.trim()) {
      setLocalAccounts(prev =>
        prev.map(acc => {
          if (acc.email.toLowerCase() === normEmail) {
            return { ...acc, password: newPass };
          }
          return acc;
        })
      );
      // Clean up code
      setRecoveryCodes(prev => {
        const copy = { ...prev };
        delete copy[normEmail];
        return copy;
      });

      // Automatically log the restored user in
      await signInWithEmail(normEmail, newPass);
      return true;
    }

    return false;
  };

  // 6. Admin Portal Actions
  const adminLogin = (username: string, pass: string): boolean => {
    if (username.trim() === "admin" && pass === "admin1234") {
      setIsAdmin(true);
      setIsGuest(false);
      setUser({ email: "admin@biblequest.com", uid: "admin", displayName: "Archbishop Admin" });
      setProfile({
        username: "Archbishop Admin",
        level: 12,
        xp: 99999,
        gamesPlayed: 500,
        hintsUsed: 0,
        lastActive: new Date().toISOString(),
      });
      localStorage.setItem("bible_quest_admin_session", "true");
      return true;
    }
    return false;
  };

  const adminAddUser = (email: string, username: string, pass: string, startLevel: number): string | null => {
    const norm = email.trim().toLowerCase();
    const cleanUName = username.trim();
    if (localAccounts.some(acc => acc.email.toLowerCase() === norm)) {
      return "Email already registered.";
    }
    if (localAccounts.some(acc => acc.username.toLowerCase() === cleanUName.toLowerCase())) {
      return "Username already registered.";
    }

    const newAcc: LocalUserAccount = {
      email: norm,
      username: username.trim(),
      password: pass,
      level: startLevel,
      xp: (startLevel - 1) * 500 + 100,
      gamesPlayed: 0,
      hintsUsed: 0,
      isBanned: false,
      isGoogleUser: false,
    };

    setLocalAccounts(prev => [...prev, newAcc]);
    return null; // success
  };

  const adminToggleBanUser = (email: string) => {
    const norm = email.trim().toLowerCase();
    setLocalAccounts(prev => {
      const updated = prev.map(acc => {
        if (acc.email.toLowerCase() === norm) {
          const nextBanned = !acc.isBanned;
          return { ...acc, isBanned: nextBanned };
        }
        return acc;
      });

      // If banned and is currently signed in user, log them out immediately
      const found = updated.find(acc => acc.email.toLowerCase() === norm);
      if (found && found.isBanned && user && user.email.toLowerCase() === norm) {
        logOut();
      }

      return updated;
    });
  };

  const adminDeleteUser = (email: string) => {
    const norm = email.trim().toLowerCase();
    if (user && user.email.toLowerCase() === norm) {
      logOut();
    }
    setLocalAccounts(prev => prev.filter(acc => acc.email.toLowerCase() !== norm));
  };

  const getAllUsers = (): LocalUserAccount[] => {
    return localAccounts;
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignored for offline usage
    }
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    setIsGuest(true);
    localStorage.removeItem("bible_quest_session_email");
    localStorage.removeItem("bible_quest_admin_session");
  };

  const setGuestUsername = (name: string) => {
    const clean = name.slice(0, 20).trim();
    if (clean) {
      setGuestProfile((prev) => ({ ...prev, username: clean }));
    }
  };

  const updateProgress = async (wordsFound: number, hintsUsedInRun: number, levelsPassedRef: number) => {
    const earnedXp = wordsFound * 15 + levelsPassedRef * 100;

    if (isGuest && !user) {
      setGuestProfile((prev) => {
        const nextLevel = prev.level + levelsPassedRef;
        const boundedNextLevel = Math.min(nextLevel, BIBLE_THEMES.length + 1);
        return {
          ...prev,
          level: boundedNextLevel,
          xp: prev.xp + earnedXp,
          gamesPlayed: prev.gamesPlayed + 1,
          hintsUsed: prev.hintsUsed + hintsUsedInRun,
          lastActive: new Date().toISOString(),
        };
      });
    } else if (user) {
      // 1. Update overall list profile cache
      const userMail = user.email || "";
      setLocalAccounts(prev =>
        prev.map(acc => {
          if (acc.email.toLowerCase() === userMail.toLowerCase()) {
            const nextLevel = Math.min(acc.level + levelsPassedRef, BIBLE_THEMES.length + 1);
            return {
              ...acc,
              level: nextLevel,
              xp: acc.xp + earnedXp,
              gamesPlayed: acc.gamesPlayed + 1,
              hintsUsed: acc.hintsUsed + hintsUsedInRun,
            };
          }
          return acc;
        })
      );

      // 2. Update immediate state profile
      if (profile) {
        const nextLevel = profile.level + levelsPassedRef;
        const boundedNextLevel = Math.min(nextLevel, BIBLE_THEMES.length + 1);
        const updatedProfile: UserProfile = {
          username: profile.username,
          level: boundedNextLevel,
          xp: profile.xp + earnedXp,
          gamesPlayed: profile.gamesPlayed + 1,
          hintsUsed: profile.hintsUsed + hintsUsedInRun,
          lastActive: new Date().toISOString(),
        };
        setProfile(updatedProfile);

        // 3. Try to sync to actual Firestore cloud document
        try {
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, {
            ...updatedProfile,
            lastActive: serverTimestamp()
          });

          if (levelsPassedRef > 0) {
            await logAchievement(
              user.uid,
              profile.username,
              `advanced to Level ${boundedNextLevel}: ${
                BIBLE_THEMES[boundedNextLevel - 1]?.title || "Eternity Quest"
              }!`
            );
          } else {
            await logAchievement(
              user.uid,
              profile.username,
              `completed a Bible Quest puzzle in Level ${profile.level} with ${hintsUsedInRun} hints used!`
            );
          }
        } catch {
          // Handled offline gracefully
        }
      }
    }
  };

  const submitLeaderboardScore = async (score: number, level: number, hintsUsed: number) => {
    const activeUsername = user && profile ? profile.username : guestProfile.username;

    // Local client-side scoreboard insertion for 100% offline-ready feedback
    setLeaderboard((prev) => {
      const activeUid = user ? user.uid : "guest";
      const filtered = prev.filter((item) => item.userId !== activeUid);
      const joined = [
        ...filtered,
        {
          userId: activeUid,
          username: activeUsername,
          score,
          level,
          hintsUsed,
          completedAt: new Date().toISOString(),
        },
      ];
      return joined.sort((a, b) => b.score - a.score);
    });

    if (user && !isGuest && user.uid !== "guest") {
      try {
        const scoreDocRef = doc(db, "leaderboards", currentDayId, "scores", user.uid);
        const snap = await getDoc(scoreDocRef);
        if (snap.exists()) {
          const oldData = snap.data();
          if (oldData && oldData.score >= score) {
            return;
          }
        }

        const scoreEntry: LeaderboardEntry = {
          userId: user.uid,
          username: activeUsername,
          score,
          level,
          hintsUsed,
          completedAt: serverTimestamp(),
        };

        await setDoc(scoreDocRef, scoreEntry);
        await logAchievement(user.uid, activeUsername, `scored a mighty ${score} points on the Daily Leaderboard!`);
      } catch {
        // Handled offline gracefully
      }
    }
  };

  const refreshLeaderboard = () => {
    // Optional refresh trigger
  };

  return (
    <GameContext.Provider
      value={{
        user,
        profile,
        loading,
        isGuest,
        guestProfile,
        isAdmin,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        forgetPasswordGenerateCode,
        resetPasswordWithCode,
        logOut,
        setGuestUsername,
        adminLogin,
        adminAddUser,
        adminToggleBanUser,
        adminDeleteUser,
        getAllUsers,
        users: localAccounts,
        updateProgress,
        submitLeaderboardScore,
        activities,
        leaderboard,
        currentDayId,
        refreshLeaderboard,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
