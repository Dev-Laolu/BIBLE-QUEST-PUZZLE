import { BibleTheme, GridCell } from "../types";

export interface PlacedWord {
  word: string;
  clue: string;
  reference: string;
  cells: { row: number; col: number }[];
}

export interface GeneratedGrid {
  grid: GridCell[][];
  placedWords: PlacedWord[];
}

// Permitted direction vectors depending on difficulty
interface Direction {
  dRow: number;
  dCol: number;
}

const DIRECTIONS: Record<string, Direction[]> = {
  Beginner: [
    { dRow: 0, dCol: 1 }, // Horizontal Right
    { dRow: 1, dCol: 0 }, // Vertical Down
  ],
  Intermediate: [
    { dRow: 0, dCol: 1 }, // Horizontal Right
    { dRow: 1, dCol: 0 }, // Vertical Down
    { dRow: 1, dCol: 1 }, // Diagonal Down-Right
  ],
  Advanced: [
    { dRow: 0, dCol: 1 }, // Horizontal Right
    { dRow: 1, dCol: 0 }, // Vertical Down
    { dRow: 1, dCol: 1 }, // Diagonal Down-Right
    { dRow: -1, dCol: 1 }, // Diagonal Up-Right
    { dRow: 0, dCol: -1 }, // Horizontal Left (Reverse)
    { dRow: -1, dCol: 0 }, // Vertical Up (Reverse)
  ],
  Expert: [
    { dRow: 0, dCol: 1 }, // Horizontal Right
    { dRow: 1, dCol: 0 }, // Vertical Down
    { dRow: 1, dCol: 1 }, // Diagonal Down-Right
    { dRow: -1, dCol: 1 }, // Diagonal Up-Right
    { dRow: 0, dCol: -1 }, // Horizontal Left (Reverse)
    { dRow: -1, dCol: 0 }, // Vertical Up (Reverse)
    { dRow: -1, dCol: -1 }, // Diagonal Up-Left (Reverse)
    { dRow: 1, dCol: -1 }, // Diagonal Down-Left (Reverse)
  ],
};

const RANDOM_KEY_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function generateWordPuzzle(theme: BibleTheme): GeneratedGrid {
  const size = theme.gridSize;
  const difficulty = theme.difficulty;
  const allowedDirs = DIRECTIONS[difficulty] || DIRECTIONS.Beginner;

  // Let's implement up to 5 retries to generate the entire board if some words get stuck
  for (let attempt = 0; attempt < 5; attempt++) {
    // 1. Initialize empty matrix
    const matrix: string[][] = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""));

    const placedWords: PlacedWord[] = [];

    // Sort words longest first to guarantee easier packing
    const sortedWords = [...theme.words].sort(
      (a, b) => b.word.length - a.word.length
    );

    let allPlaced = true;

    for (const bibleWord of sortedWords) {
      const uWord = bibleWord.word.toUpperCase();
      let placed = false;

      // Try placing this specific word (max 150 trials)
      for (let trial = 0; trial < 150; trial++) {
        const dir = allowedDirs[Math.floor(Math.random() * allowedDirs.length)];
        const wordLen = uWord.length;

        // Choose start coordinates within boundaries
        let maxStartRow = size - 1;
        let minStartRow = 0;
        let maxStartCol = size - 1;
        let minStartCol = 0;

        if (dir.dRow > 0) maxStartRow = size - wordLen;
        if (dir.dRow < 0) minStartRow = wordLen - 1;
        if (dir.dCol > 0) maxStartCol = size - wordLen;
        if (dir.dCol < 0) minStartCol = wordLen - 1;

        if (minStartRow > maxStartRow || minStartCol > maxStartCol) {
          continue;
        }

        const startRow =
          minStartRow +
          Math.floor(Math.random() * (maxStartRow - minStartRow + 1));
        const startCol =
          minStartCol +
          Math.floor(Math.random() * (maxStartCol - minStartCol + 1));

        // Check if fits cleanly
        let canFit = true;
        const candidateCells: { row: number; col: number }[] = [];

        for (let i = 0; i < wordLen; i++) {
          const r = startRow + i * dir.dRow;
          const c = startCol + i * dir.dCol;

          if (r < 0 || r >= size || c < 0 || c >= size) {
            canFit = false;
            break;
          }

          const existingChar = matrix[r][c];
          if (existingChar !== "" && existingChar !== uWord[i]) {
            canFit = false;
            break;
          }

          candidateCells.push({ row: r, col: c });
        }

        if (canFit) {
          // Commit word to matrix
          for (let i = 0; i < wordLen; i++) {
            const { row, col } = candidateCells[i];
            matrix[row][col] = uWord[i];
          }

          placedWords.push({
            word: uWord,
            clue: bibleWord.clue,
            reference: bibleWord.reference,
            cells: candidateCells,
          });

          placed = true;
          break; // successfully placed this word
        }
      }

      if (!placed) {
        allPlaced = false;
        break; // Failed to place one of the words, break and retry entire grid
      }
    }

    if (allPlaced) {
      // 2. Fill empty spaces with random decorative letters
      const finalGrid: GridCell[][] = [];
      for (let r = 0; r < size; r++) {
        const rowCells: GridCell[] = [];
        for (let c = 0; c < size; c++) {
          let char = matrix[r][c];
          if (char === "") {
            char =
              RANDOM_KEY_LETTERS[
                Math.floor(Math.random() * RANDOM_KEY_LETTERS.length)
              ];
          }
          rowCells.push({
            char,
            row: r,
            col: c,
          });
        }
        finalGrid.push(rowCells);
      }

      // Map back to match initial word order of theme
      const reorderedPlaced: PlacedWord[] = [];
      for (const originalWord of theme.words) {
        const found = placedWords.find((pw) => pw.word === originalWord.word);
        if (found) {
          reorderedPlaced.push(found);
        }
      }

      return {
        grid: finalGrid,
        placedWords: reorderedPlaced,
      };
    }
  }

  // Backup fallback: return a simple grid with whatever could be placed
  const finalGrid: GridCell[][] = [];
  for (let r = 0; r < size; r++) {
    const rowCells: GridCell[] = [];
    for (let c = 0; c < size; c++) {
      const char =
        RANDOM_KEY_LETTERS[
          Math.floor(Math.random() * RANDOM_KEY_LETTERS.length)
        ];
      rowCells.push({ char, row: r, col: c });
    }
    finalGrid.push(rowCells);
  }
  return { grid: finalGrid, placedWords: [] };
}
