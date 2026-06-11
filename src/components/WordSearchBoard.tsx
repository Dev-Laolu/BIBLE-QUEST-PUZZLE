import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import { BibleTheme, GridCell } from "../types";
import { generateWordPuzzle, GeneratedGrid, PlacedWord } from "../utils/GridGenerator";
import { BIBLE_THEMES } from "../bibleThemes";
import {
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  Trophy,
  ArrowRight,
  Info,
  Compass,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface WordSearchBoardProps {
  currentTheme: BibleTheme;
  onNextLevel: () => void;
  onNavigateToLeaderboard: () => void;
}

interface FoundWord {
  word: string;
  cells: { row: number; col: number }[];
  color: string;
}

// Immersive rich medieval highlight colors
const HIGHLIGHT_COLORS = [
  "bg-[#d4af37]/35 border border-[#d4af37]/60 text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.25)]",
  "bg-[#8a6d1a]/35 border border-[#8a6d1a]/60 text-stone-200",
  "bg-emerald-800/30 border border-emerald-500/40 text-emerald-300",
  "bg-sky-800/30 border border-sky-500/40 text-sky-300",
  "bg-rose-800/30 border border-rose-500/40 text-rose-300",
  "bg-purple-800/30 border border-purple-500/40 text-purple-300",
];

export const WordSearchBoard: React.FC<WordSearchBoardProps> = ({
  currentTheme,
  onNextLevel,
  onNavigateToLeaderboard,
}) => {
  const { updateProgress, submitLeaderboardScore, profile } = useGame();

  // Grid size directly corresponds to the theme definition
  const currentGridSize = currentTheme.gridSize;

  // Grid states
  const [puzzle, setPuzzle] = useState<GeneratedGrid | null>(null);
  const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ row: number; col: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ row: number; col: number } | null>(null);
  const [activeClueIndex, setActiveClueIndex] = useState<number>(0);

  // Stats
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [activeHintCell, setActiveHintCell] = useState<{ row: number; col: number } | null>(null);
  const [isVictory, setIsVictory] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and rebuild grid
  useEffect(() => {
    initPuzzle();
  }, [currentTheme]);

  // Start / Reset Timer
  useEffect(() => {
    setTimeElapsed(0);
    setIsVictory(false);
    setFoundWords([]);
    setActiveHintCell(null);
    setHintsUsedCount(0);
    setActiveClueIndex(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [puzzle]);

  const getCellFontSizeClass = (gridSize: number) => {
    if (gridSize >= 13) {
      return "text-[9px] xs:text-[10px] sm:text-xs md:text-sm lg:text-base";
    }
    if (gridSize >= 11) {
      return "text-[11px] xs:text-xs sm:text-sm md:text-base lg:text-lg";
    }
    return "text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl";
  };

  const initPuzzle = () => {
    const generated = generateWordPuzzle(currentTheme);
    setPuzzle(generated);
  };

  // Format Elapsed Timer
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Helper to trace selected line of cells
  const getSelectedCells = (
    start: { row: number; col: number } | null,
    end: { row: number; col: number } | null
  ) => {
    if (!start || !end) return [];

    const cells: { row: number; col: number }[] = [];
    const rDiff = end.row - start.row;
    const cDiff = end.col - start.col;

    const steps = Math.max(Math.abs(rDiff), Math.abs(cDiff));
    if (steps === 0) {
      return [start];
    }

    // Check if straight line (Horizontal, Vertical, or exact Diagonal)
    const isHorizontal = rDiff === 0;
    const isVertical = cDiff === 0;
    const isDiagonal = Math.abs(rDiff) === Math.abs(cDiff);

    if (!isHorizontal && !isVertical && !isDiagonal) {
      // If diagonal is slightly skewed, project to nearest 45 degree
      return [];
    }

    const rStep = rDiff === 0 ? 0 : rDiff / Math.abs(rDiff);
    const cStep = cDiff === 0 ? 0 : cDiff / Math.abs(cDiff);

    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: start.row + i * rStep,
        col: start.col + i * cStep,
      });
    }

    return cells;
  };

  // Helper to extract characters from traced path
  const getSelectedWordText = (cells: { row: number; col: number }[]) => {
    if (!puzzle || cells.length === 0) return "";
    return cells.map((cell) => puzzle.grid[cell.row][cell.col].char).join("");
  };

  // Handle Drag Selection Start
  const handleCellStart = (row: number, col: number) => {
    if (isVictory) return;
    setIsSelecting(true);
    setSelectionStart({ row, col });
    setSelectionEnd({ row, col });
    setActiveHintCell(null);
  };

  // Handle Drag Selection Move
  const handleCellHover = (row: number, col: number) => {
    if (!isSelecting) return;
    setSelectionEnd({ row, col });
  };

  // Verify match on touch release or mouse release
  const handleSelectionEnd = () => {
    if (!isSelecting || !selectionStart || !selectionEnd || !puzzle) {
      setIsSelecting(false);
      return;
    }

    setIsSelecting(false);
    const cells = getSelectedCells(selectionStart, selectionEnd);
    if (cells.length > 0) {
      const selectedText = getSelectedWordText(cells);
      const reversedText = selectedText.split("").reverse().join("");

      // Find if we have a match in theme words
      const matchingWord = puzzle.placedWords.find(
        (pw) =>
          (pw.word === selectedText || pw.word === reversedText) &&
          !foundWords.some((fw) => fw.word === pw.word)
      );

      if (matchingWord) {
        // Success match! Register found word
        const color = HIGHLIGHT_COLORS[foundWords.length % HIGHLIGHT_COLORS.length];
        const newFound = {
          word: matchingWord.word,
          cells,
          color,
        };

        const updatedFound = [...foundWords, newFound];
        setFoundWords(updatedFound);

        // Advance clue focus index if applicable
        const unfoundIndex = puzzle.placedWords.findIndex(
          (pw) => !updatedFound.some((fw) => fw.word === pw.word)
        );
        if (unfoundIndex !== -1) {
          setActiveClueIndex(unfoundIndex);
        }

        // Check if all words completed
        if (updatedFound.length === puzzle.placedWords.length) {
          handleVictory(updatedFound);
        }
      }
    }

    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Mobile Touch support
  const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    e.preventDefault();
    handleCellStart(row, col);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSelecting || !containerRef.current) return;
    e.preventDefault();

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const rowAttr = element.getAttribute("data-row");
    const colAttr = element.getAttribute("data-col");

    if (rowAttr !== null && colAttr !== null) {
      const row = parseInt(rowAttr, 10);
      const col = parseInt(colAttr, 10);
      handleCellHover(row, col);
    }
  };

  // Process Completed Level Victory
  const handleVictory = async (finalFound: FoundWord[]) => {
    setIsVictory(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Score calculations
    const baseScore = currentTheme.words.length * 100;
    const timeBonus = Math.max(500 - timeElapsed, 50);
    const difficultyMultiplier =
      currentTheme.difficulty === "Beginner"
        ? 1.0
        : currentTheme.difficulty === "Intermediate"
        ? 1.3
        : currentTheme.difficulty === "Advanced"
        ? 1.6
        : 2.0;

    const hintPenalty = hintsUsedCount * 40;
    const score = Math.max(Math.round((baseScore + timeBonus) * difficultyMultiplier) - hintPenalty, 150);
    setCalculatedScore(score);

    // Determine progress flow: Is the user completing their maximum unlocked level?
    const userMaxLevel = profile?.level || 1;
    const advancedLevels = currentTheme.level === userMaxLevel ? 1 : 0;

    // Sync progress to cloud database or local
    await updateProgress(currentTheme.words.length, hintsUsedCount, advancedLevels);
    await submitLeaderboardScore(score, currentTheme.level, hintsUsedCount);
  };

  // Hint activation system
  const handleTriggerHint = () => {
    if (!puzzle || isVictory) return;

    // Find first word that hasn't been solved
    const unsolvedWord = puzzle.placedWords.find(
      (pw) => !foundWords.some((fw) => fw.word === pw.word)
    );

    if (unsolvedWord && unsolvedWord.cells.length > 0) {
      const firstCell = unsolvedWord.cells[0];
      setActiveHintCell(firstCell);
      setHintsUsedCount((prev) => prev + 1);

      // Select clue corresponding to hint
      const index = puzzle.placedWords.indexOf(unsolvedWord);
      if (index !== -1) {
        setActiveClueIndex(index);
      }

      // Hide hint glow after 3 seconds
      setTimeout(() => {
        setActiveHintCell(null);
      }, 3000);
    }
  };

  // Verify if a specific cell coordinates are in the current selecting trace list
  const selectedTraceCells = getSelectedCells(selectionStart, selectionEnd);
  const isCellTracing = (row: number, col: number) => {
    return selectedTraceCells.some((cell) => cell.row === row && cell.col === col);
  };

  // Verify if a cell belongs to a permanently found word line
  const getCellFoundColor = (row: number, col: number) => {
    const match = foundWords.find((fw) =>
      fw.cells.some((cell) => cell.row === row && cell.col === col)
    );
    return match ? match.color : "";
  };

  if (!puzzle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-stone-500">
        <Compass className="w-10 h-10 animate-spin text-[#d4af37] mb-4" />
        <p className="text-sm text-[#d4af37] font-mono">CONFIGURING SCRIPTURE SEARCH GRID...</p>
      </div>
    );
  }

  const activeClue = puzzle.placedWords[activeClueIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Search Grid Left Section */}
      <div className="lg:col-span-7 space-y-4">
        {/* Board stats bar */}
        <div className="flex items-center justify-between p-4 bg-[#1f130d] rounded-2xl border border-[#3d271b] shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest font-mono">
              STAGE LEVEL {currentTheme.level}
            </span>
            <h3 className="font-serif font-bold text-lg text-[#d4af37] leading-tight">
              {currentTheme.title}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="block text-[10px] font-mono text-stone-500">CHRONOMETER</span>
              <span className="font-bold text-stone-200 font-mono">
                {formatTime(timeElapsed)}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-[#3d271b]"></div>
            <div>
              <span className="block text-[10px] font-mono text-stone-500">FOUND</span>
              <span className="font-extrabold text-[#d4af37] font-mono">
                {foundWords.length}/{puzzle.placedWords.length}
              </span>
            </div>
          </div>
        </div>

        {/* The Word Search Playing Card Canvas */}
        <div className="relative bg-[#150d09] p-6 rounded-3xl border border-[#3d271b] shadow-xl">
          {/* Touch prevention wrapper */}
          <div
            ref={containerRef}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleSelectionEnd}
            onMouseUp={handleSelectionEnd}
            onMouseLeave={handleSelectionEnd}
            className="w-full select-none touch-none aspect-square bg-[#2d1b14] p-1.5 sm:p-3 rounded-2xl border-4 border-[#3d271b] flex items-center justify-center overflow-hidden shadow-inner"
          >
            <div
              className="grid w-full h-full max-w-full"
              style={{
                gridTemplateColumns: `repeat(${currentGridSize}, minmax(0, 1fr))`,
                gap: currentGridSize >= 13 ? "3px" : currentGridSize >= 11 ? "4px" : "6px",
              }}
            >
              {puzzle.grid.map((rowCells, rIndex) =>
                rowCells.map((cell, cIndex) => {
                  const tracing = isCellTracing(cell.row, cell.col);
                  const foundColor = getCellFoundColor(cell.row, cell.col);
                  const isHinted = activeHintCell?.row === cell.row && activeHintCell?.col === cell.col;

                  return (
                    <div
                      key={`${rIndex}-${cIndex}`}
                      data-row={cell.row}
                      data-col={cell.col}
                      onMouseDown={() => handleCellStart(cell.row, cell.col)}
                      onMouseEnter={() => handleCellHover(cell.row, cell.col)}
                      onTouchStart={(e) => handleTouchStart(e, cell.row, cell.col)}
                      className={`
                        relative flex items-center justify-center font-bold select-none cursor-pointer rounded-xs aspect-square transition-all duration-150 uppercase leading-none
                        ${getCellFontSizeClass(currentGridSize)}
                        ${
                          tracing
                            ? "bg-[#d4af37] text-[#0c0806] scale-95 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                            : foundColor
                            ? `${foundColor} scale-100`
                            : "bg-[#1f130d] hover:bg-[#3d271b] border border-[#3d271b] text-stone-200 hover:text-[#d4af37]"
                        }
                        ${isHinted ? "ring-4 ring-[#d4af37]/60 animate-pulse bg-[#d4af37]/25" : ""}
                      `}
                    >
                      <span className="pointer-events-none">{cell.char}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={initPuzzle}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-[#d4af37] transition-all px-3 py-2 rounded-xl hover:bg-[#1f130d] border border-transparent hover:border-[#3d271b] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Clues & Words Right Section */}
      <div className="lg:col-span-5 space-y-4">
        {/* Knowledge & Clue Card */}
        <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#d4af37] uppercase tracking-widest font-serif mb-2">
            <HelpCircle className="w-4 h-4" />
            Scripture Trivia Clue Focus
          </div>

          <AnimatePresence mode="wait">
            {activeClue ? (
              <motion.div
                key={activeClueIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="space-y-2 py-1"
              >
                <p className="text-stone-300 text-sm font-medium italic leading-relaxed font-serif">
                  "{activeClue.clue}"
                </p>
                <div className="flex items-center justify-between pt-2 text-xs text-stone-500 font-mono">
                  <span>Reference: {activeClue.reference}</span>
                  <span className="text-[#d4af37]">{activeClue.word.length} Letters</span>
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-stone-500 italic">No active word selection.</p>
            )}
          </AnimatePresence>
        </div>

        {/* Word List To Be Found */}
        <div className="bg-[#150d09] border border-[#3d271b] p-5 rounded-3xl shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest font-mono">
            Words to find ({puzzle.placedWords.length - foundWords.length} Left)
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            {puzzle.placedWords.map((pw, index) => {
              const isFound = foundWords.some((fw) => fw.word === pw.word);
              const isActive = activeClueIndex === index;

              return (
                <button
                  key={pw.word}
                  onClick={() => setActiveClueIndex(index)}
                  className={`
                    relative group flex items-center justify-between p-3 rounded-xl border text-left text-xs font-bold transition-all
                    ${
                      isFound
                        ? "bg-[#0c0806]/40 text-stone-600 line-through border border-[#3d271b]/20"
                        : isActive
                        ? "bg-[#2d1b14] border-2 border-[#d4af37] text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.05)]"
                        : "bg-[#1f130d] hover:bg-[#3d271b] border border-[#3d271b] text-stone-300"
                    }
                  `}
                >
                  <span className="font-mono tracking-wider">{pw.word}</span>
                  {isFound ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="text-[9px] text-stone-500 group-hover:text-stone-300 font-mono">
                      {pw.word.length}L
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Victory Celebration Modal */}
      <AnimatePresence>
        {isVictory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#1f130d] border-2 border-[#3d271b] p-8 rounded-3xl text-center shadow-2xl space-y-6 text-stone-200"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                <Trophy className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest font-mono">
                  LEVEL COMPLETED!
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#d4af37] leading-tight">
                  Mighty Breakthrough!
                </h3>
                <p className="text-sm text-stone-450 max-w-xs mx-auto">
                  You successfully navigated the word search puzzle of "{currentTheme.title}"!
                </p>
              </div>

              {/* Stats Review */}
              <div className="grid grid-cols-3 gap-3 bg-[#0c0806] p-4 rounded-xl border border-[#3d271b]">
                <div>
                  <span className="block text-[10px] text-stone-500 font-mono">TIME SPENT</span>
                  <span className="font-extrabold text-stone-200">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-500 font-mono">HINTS USED</span>
                  <span className="font-extrabold text-stone-200">
                    {hintsUsedCount}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-stone-500 font-mono">POINTS</span>
                  <span className="font-extrabold text-[#d4af37] font-mono">
                    {calculatedScore}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onNavigateToLeaderboard}
                  className="flex-1 py-3 px-4 font-bold border border-[#3d271b] hover:bg-[#2d1b14] text-stone-300 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Leaderboards
                </button>
                <button
                  onClick={onNextLevel}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-gradient-to-r from-[#8a6d1a] to-[#d4af37] text-[#0c0806] font-bold rounded-xl text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:brightness-110 active:scale-98 cursor-pointer"
                >
                  Next Quest
                  <ArrowRight className="w-4 h-4 text-[#0c0806]" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
