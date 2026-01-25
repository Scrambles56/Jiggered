"use client";

import { useState } from "react";
import Link from "next/link";

interface PuzzleTile {
  letters: string[][];
}

interface PuzzleData {
  gridSize: { rows: number; cols: number };
  tiles: PuzzleTile[];
}

type Mode = "enter" | "edit" | "play";

// Grid is 5x5 tiles
const GRID_SIZE = 5;

export default function PlayPage() {
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("enter");
  const [editingCell, setEditingCell] = useState<{
    tileIndex: number;
    row: number;
    col: number;
  } | null>(null);

  // Track which tile is placed at each grid position (null = empty)
  const [grid, setGrid] = useState<(number | null)[][]>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  const [draggedTile, setDraggedTile] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/puzzle?passphrase=${encodeURIComponent(passphrase.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load puzzle");
        return;
      }

      setPuzzleData(data.puzzleData);
      setMode("edit");
    } catch {
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLetterChange = (tileIndex: number, row: number, col: number, value: string) => {
    if (!puzzleData) return;

    const newTiles = puzzleData.tiles.map((tile, i) => {
      if (i !== tileIndex) return tile;
      const newLetters = tile.letters.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? value.toUpperCase().slice(-1) || "-" : c))
      );
      return { ...tile, letters: newLetters };
    });

    setPuzzleData({ ...puzzleData, tiles: newTiles });
  };

  const handleCellClick = (tileIndex: number, row: number, col: number) => {
    if (mode !== "edit") return;
    setEditingCell({ tileIndex, row, col });
  };

  const handleConfirmTiles = () => {
    setEditingCell(null);
    setMode("play");
    // Reset grid when entering play mode
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  };

  // Get list of tile indices that are not yet placed on the grid
  const getUnplacedTiles = (): number[] => {
    const placedTiles = new Set(grid.flat().filter((t) => t !== null));
    return puzzleData?.tiles.map((_, i) => i).filter((i) => !placedTiles.has(i)) || [];
  };

  // Drag and drop handlers
  const handleDragStart = (tileIndex: number) => {
    setDraggedTile(tileIndex);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnGrid = (gridRow: number, gridCol: number) => {
    if (draggedTile === null) return;

    // If there's already a tile here, swap it back to unplaced
    const newGrid = grid.map((row) => [...row]);

    // Remove the dragged tile from its current position if it's on the grid
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] === draggedTile) {
          newGrid[r][c] = null;
        }
      }
    }

    // Place the tile at the new position
    newGrid[gridRow][gridCol] = draggedTile;
    setGrid(newGrid);
    setDraggedTile(null);
  };

  const handleDropOnUnplaced = () => {
    if (draggedTile === null) return;

    // Remove tile from grid
    const newGrid = grid.map((row) =>
      row.map((cell) => (cell === draggedTile ? null : cell))
    );
    setGrid(newGrid);
    setDraggedTile(null);
  };

  const renderTile = (tile: PuzzleTile, tileIndex: number, draggable: boolean = false) => (
    <div
      key={tileIndex}
      draggable={draggable}
      onDragStart={() => handleDragStart(tileIndex)}
      className={`grid grid-cols-3 gap-px bg-zinc-300 dark:bg-zinc-600 rounded overflow-hidden ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {tile.letters.map((row, rowIndex) =>
        row.map((letter, colIndex) => {
          const isEditing =
            editingCell?.tileIndex === tileIndex &&
            editingCell?.row === rowIndex &&
            editingCell?.col === colIndex;
          const isEmpty = letter === "-";

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(tileIndex, rowIndex, colIndex)}
              className={`
                w-8 h-8 flex items-center justify-center text-sm font-bold
                ${isEmpty ? "bg-zinc-800 dark:bg-zinc-900" : "bg-white dark:bg-zinc-700"}
                ${mode === "edit" && !isEmpty ? "cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900" : ""}
                ${isEditing ? "ring-2 ring-blue-500" : ""}
              `}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={letter === "-" ? "" : letter}
                  onChange={(e) => handleLetterChange(tileIndex, rowIndex, colIndex, e.target.value)}
                  onBlur={() => setEditingCell(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                  autoFocus
                  className="w-full h-full text-center bg-transparent outline-none text-zinc-900 dark:text-zinc-50"
                  maxLength={1}
                />
              ) : isEmpty ? null : (
                <span className="text-zinc-900 dark:text-zinc-50">{letter}</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const renderGridCell = (gridRow: number, gridCol: number) => {
    const tileIndex = grid[gridRow][gridCol];
    const tile = tileIndex !== null ? puzzleData?.tiles[tileIndex] : null;

    return (
      <div
        key={`${gridRow}-${gridCol}`}
        onDragOver={handleDragOver}
        onDrop={() => handleDropOnGrid(gridRow, gridCol)}
        className={`
          w-[104px] h-[104px] rounded-lg border-2 border-dashed
          flex items-center justify-center
          ${tile ? "border-transparent" : "border-zinc-400 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800/50"}
        `}
      >
        {tile && renderTile(tile, tileIndex!, true)}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8 dark:bg-zinc-900">
      <Link
        href="/"
        className="mb-8 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        ← Back
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {mode === "enter" && "Play Puzzle"}
        {mode === "edit" && "Review & Correct"}
        {mode === "play" && "Solve Puzzle"}
      </h1>

      {mode === "enter" && (
        <div className="w-full max-w-md">
          <p className="mb-6 text-center text-zinc-600 dark:text-zinc-400">
            Enter the passphrase from your phone
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value.toLowerCase())}
              placeholder="apple-river-cloud-fish"
              className="h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-center font-mono text-lg text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />

            <button
              type="submit"
              disabled={isLoading || !passphrase.trim()}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-blue-600 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-zinc-400"
            >
              {isLoading ? "Loading..." : "Load Puzzle"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      )}

      {mode === "edit" && puzzleData && (
        <div className="w-full max-w-4xl">
          <p className="mb-4 text-center text-zinc-600 dark:text-zinc-400">
            Click any letter to correct it, then confirm when ready
          </p>

          <div className="grid grid-cols-5 gap-3 mb-6 mx-auto w-fit">
            {puzzleData.tiles.map((tile, index) => renderTile(tile, index))}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setMode("enter")}
              className="px-6 py-3 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back
            </button>
            <button
              onClick={handleConfirmTiles}
              className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
            >
              Confirm & Start Solving
            </button>
          </div>
        </div>
      )}

      {mode === "play" && puzzleData && (
        <div className="w-full">
          <p className="mb-4 text-center text-zinc-600 dark:text-zinc-400">
            Drag tiles onto the grid to form valid words across and down
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Main puzzle grid (5x5 drop zones) */}
            <div className="grid grid-cols-5 gap-1 p-4 bg-zinc-200 dark:bg-zinc-800 rounded-xl">
              {Array(GRID_SIZE).fill(null).map((_, rowIndex) =>
                Array(GRID_SIZE).fill(null).map((_, colIndex) =>
                  renderGridCell(rowIndex, colIndex)
                )
              )}
            </div>

            {/* Unplaced tiles */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropOnUnplaced}
              className="p-4 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-[320px] h-[548px] flex flex-col"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 text-center shrink-0">
                Unplaced tiles ({getUnplacedTiles().length})
              </p>
              <div className="overflow-y-auto flex-1">
                <div className="grid grid-cols-3 gap-2">
                  {getUnplacedTiles().map((tileIndex) =>
                    renderTile(puzzleData.tiles[tileIndex], tileIndex, true)
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={() => setMode("edit")}
              className="px-6 py-3 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              ← Back to Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
