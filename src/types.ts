export interface UserProfile {
  username: string;
  level: number;
  xp: number;
  gamesPlayed: number;
  hintsUsed: number;
  lastActive: any; // ServerTimestamp or ISO string
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  level: number;
  hintsUsed: number;
  completedAt: any;
}

export interface CommunityActivity {
  id?: string;
  userId: string;
  username: string;
  text: string;
  timestamp: any;
}

export interface BibleWord {
  word: string; // Uppercase always
  clue: string; // Brief Bible knowledge description or verse trivia
  reference: string; // Bible verse reference, e.g. "Gen 1:1"
}

export interface BibleTheme {
  level: number;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  gridSize: number;
  words: BibleWord[];
}

export interface GridCell {
  char: string;
  row: number;
  col: number;
}

export interface Placement {
  word: string;
  startRow: number;
  startCol: number;
  dRow: number;
  dCol: number;
}
