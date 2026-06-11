# Bible Quest: Word Search

Welcome to **Bible Quest: Word Search**, an engaging and immersive scripture-driven word puzzle adventure. Built with React, TypeScript, and Tailwind CSS, this offline-first application takes players through progressive standard and complex levels covering various Old and New Testament chapters. 

The application offers full player analytics, persistent local-storage fallback, an interactive real-time global leaderboard, a community post feed, customizable profiles, and a robust administrator’s workspace.

   * * *

## 📖 App Overview & Key Features

Bible Quest blends the retro excitement of classic word search grids with modern, beautifully styled gameplay mechanics:

- **Scripture-Focused Word Puzzles**: Play through curated biblical themes (e.g., Genesis Creation, Noah’s Ark, Moses & the Exodus, David & Goliath, The Nativity, and Miracles) complete with interactive clues and underlying scripture references (e.g., Genesis 2:7, John 2:11).
- **Adaptive Grid & Enlarged Puzzles**: Supports progressive difficulty levels with scaling puzzle footprints (from standard grids up to high-density grids featuring 8, 10, or up to 16 full-sized theme words).
- **Smart Font Scale System**: To accommodate large collections of words (12, 14, 16 count) on device displays, the grid automatically shrinks line spacings and scales letter font sizing from classic display fonts to highly legible dense structures.
- **Account Identification & Dual-Login Support**: Login using either registered Email Addresses or unique Custom Usernames. The Auth gate includes visible password toggle switches (`Eye` / `EyeOff`) to avoid frustrating typos.
- **Persistent Global Leaderboards**: Synchronize level timing, scores, and hints-used statistics to showcase on the community board.
- **Interactive Pilgrim Feed**: Connect with other players by sharing automated level-completion milestones or custom textual reflections.
- **Secret Administrator Workspace (`admin`)**: A full control room allowing administrators to enroll new players, set custom start levels, temporarily suspend accounts (banning), or securely delete accounts.

---

## 🗂️ Folder Structure

Below is an overview of the modular codebase architecture implemented in this workspace:

```text
├── / (Root Directory)
│   ├── .env.example                # Sample environment configurations for secrets
│   ├── .gitignore                  # Specific patterns to ignore node_modules and compilation targets
│   ├── firebase-blueprint.json      # Firestore schemas, database blueprints, and indices definitions
│   ├── firestore.rules             # Rules safeguarding user read/writes and prohibiting forbidden scores
│   ├── index.html                  # Core HTML5 entry point for the browser viewport
│   ├── metadata.json               # Frame permissions, name, and major server capabilities metadata
│   ├── package.json                # Project script configurations, dependencies, and icons libraries
│   ├── tsconfig.json               # TypeScript strict compilation configurations
│   ├── vite.config.ts              # Vite asset, proxy, and build tooling parameters
│   │
│   └── /src (Source directory)
│       ├── main.tsx                # Mounts the React application tree matching Vite guidelines
│       ├── App.tsx                 # Core parent component managing the HUD and main viewport toggle
│       ├── bibleThemes.ts          # Structured level definitions containing questions, verses, grids, and clues
│       ├── firebase.ts             # Firebase initialization layer (Auth, Firestore, and fallback flags)
│       ├── index.css               # Unified Tailwind utility rules, theme fonts, and scrollbar classes
│       ├── types.ts                # Strict TypeScript contracts (User, Theme, Puzzle, Post, Score)
│       │
│       ├── /components             # Stateless & stateful reusable visual interface modules
│       │   ├── WordSearchBoard.tsx # Dynamic puzzle board driving letter-swipes, timers, and animations
│       │   ├── AuthGate.tsx        # Screen guarding the app until successful pilgrim or admin identification
│       │   ├── AuthModal.tsx       # Embedded mini-dialog for authentication prompts on sub-actions
│       │   ├── CommunityFeed.tsx   # Real-time message board for prayer requests, completion alerts, and chat
│       │   ├── LeaderboardView.tsx # Displays top speeds and highest completion scores by level
│       │   ├── ProfileView.tsx     # Lets players edit displayName, pick custom avatars, and review history
│       │   └── AdminPanel.tsx      # Comprehensive Archbishop Admin workspace (Create, Suspend, Delete users)
│       │
│       ├── /context                # Central Application Coordinates
│       │   └── GameContext.tsx     # Core React Context providing auth triggers, leaderboard, posts, and states
│       │
│       └── /utils                  # Logical processing helpers
│           └── GridGenerator.ts    # Custom backtrack grid algorithm making sure scriptures align cleanly
```

---

## 🛠️ How the App Was Built (From Scratch)

This section documents the chronological engineering steps taken to build Bible Quest from the ground up:

### Phase 1: Environment & Project Setup
We initialized a modular **Vite + React + TypeScript** project structure designed for lightning-fast reloading and strict type verification. 
1. **Dependencies Configuration (`package.json`)**: Installed high-performance styling and icon utilities including `tailwindcss` for style rules, `lucide-react` for high-contrast icons, and `motion` (imported from `motion/react`) for smooth page transition animations.
2. **Metadata Setup (`metadata.json`)**: Added application parameters. Named the application "Bible Quest: Word Search" and configured the `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` feature.

### Phase 2: System Data Model & Declarations (`src/types.ts`)
Before writing visual components, we laid the foundational TypeScript interface contracts:
- `LocalUserAccount`: Identifies credentials (email, username, password, ban/deleted condition).
- `BibleTheme` / `WordClue`: Structures puzzle properties (level, title, list of words/clues, reference chapters).
- `GeneratedGrid` / `GridCell`: Structures the generated search board including letter coordinate tracking.
- `LeaderboardEntry` / `CommunityPost`: Standardizes interactions for real-time visual streams.

### Phase 3: The Board Generation Algorithm (`src/utils/GridGenerator.ts`)
Standard random placement can lead to overlapping word overwrites. To resolve this:
1. We engineered a robust backtrack searching board generator: `generateWordPuzzle(theme: BibleTheme)`.
2. It constructs an empty $N \times N$ matrix matching the theme's `gridSize`.
3. It iterates through the theme-words list, sorting from longest to shortest to optimize packing speed.
4. For each word, it attempts variable placement directions (Horizontal, Vertical, and Diagonals - both forward and backward orientation).
5. If collisions occur (overwriting a matching letter or blocking a previous insertion), the algorithm backs up and selects alternative coordinates.
6. Empty remaining blocks are gracefully filled with randomized uppercase letters of the Hebrew/English standard alphabets (`A`-`Z`).

### Phase 4: Constructing the Interactive Board UI (`src/components/WordSearchBoard.tsx`)
The gameboard supports multi-device gesture inputs:
- **Swipe-to-Select Mechanics**: Blends Mouse Events (`onMouseDown`, `onMouseEnter`, `onMouseUp`) and Touch Events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) to calculate immediate grid trajectories (calculating vector directions: only allow standard straights and $45^\circ$ diagonals).
- **Responsive Dynamic Letter Sizing**: Adapts the size of cells based on grid proportions to ensure that level 11 & 12 puzzles with larger grid boundaries ($14 \times 14$ containing dozens of words) display optimally on smartphone screens with high-density spacing.
- **Timer & Completion Engine**: Tracks elapsed time in seconds with an active local interval. Once all words are highlighted and completed, it triggers automated modal alerts, awards XP points, and posts achievements to the user's feed.

### Phase 5: Dynamic State Registry (`src/context/GameContext.tsx`)
This context operates as the heart of database interactions:
1. **Hybrid Sync Engine**: Connects to the cloud backend (using Firebase Firestore & Auth integration rules) when online, and gracefully operates fully functional locally in standard browsers via sandbox `localStorage` arrays when server access is deferred.
2. **Flexible Auth Triggers**: Redesigned the sign-in methods to accept either registered emails or customized alphanumeric usernames.
3. **Automated Progress Verification**: Restores levels completed on page loading, locks succeeding chapters until previous missions are solved, and tallies points for correct items.

### Phase 6: Interface Polish & HUD Design (`src/App.tsx`)
The overarching style utilizes a polished **Theological Castle Slate** theme (rich `#0c0806` obsidian background, warm `#2d1b14` card grids, and fine `#d4af37` gold accents).
- **Quest Board Layout**: Features clean level picking cards with status locks. The header area was specifically clean-scaled to display only the high-contrast physical app logo (sacred open book vector) directly on active quest sheets.
- **Leaderboard & Community Feed**: Created reactive boards showing recent completions and community prayer requests.
- **Archbishop Admin View**: Designed a powerful console matching `admin` access requirements (username `admin` and password `admin1234`). Admin can register new pilgrims, temporarily ban troublemakers, or permanently delete accounts with strict browser confirmations.

---

## 🛠️ Verification & Building Instructions

To verify, test, or build the application locally:

```bash
# 1. Install necessary dependencies from package.json
npm install

# 2. Start the local Vite development explorer (runs on configured port 3000)
npm run dev

# 3. Perform a production TypeScript syntax verification scan
npm run lint

# 4. Compile a highly compressed, production-ready static build bundle in /dist
npm run build
```

This ensures full compile-time compliance and maintains outstanding runtime execution speeds across all devices and clients. Enjoy your pilgrimage on **Bible Quest**!
