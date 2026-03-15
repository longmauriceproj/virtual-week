import type { BoardSquare, SquareType } from "../types/game";

// ─── BOARD DIMENSIONS ────────────────────────────────────────────────────────

export const TOTAL_SQUARES = 122; // Total squares including start (0–121)
export const DAY_START_MINUTES = 0; // 7:00 AM = 0 minutes
export const DAY_END_MINUTES = 915; // 10:15 PM = 915 minutes after 7 AM
export const MINUTES_PER_SQUARE = 7.5;

// The single start position
export const START_POSITION = 0;

// 10 event squares evenly distributed around the track
export const EVENT_POSITIONS = new Set([
  7, 19, 31, 43, 55, 67, 79, 91, 103, 115,
]);

// ─── BOARD BUILDER ───────────────────────────────────────────────────────────

export function buildBoard(): BoardSquare[] {
  const squares: BoardSquare[] = [];

  for (let i = 0; i < TOTAL_SQUARES; i++) {
    const virtualMinutes = i * MINUTES_PER_SQUARE;

    let type: SquareType = "normal";
    if (i === START_POSITION) type = "start";
    else if (EVENT_POSITIONS.has(i)) type = "event";

    squares.push({ index: i, type, virtualMinutes });
  }

  return squares;
}

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────

export function minutesToTimeString(minutes: number): string {
  const total = Math.round(minutes);
  const hours24 = 7 + Math.floor(total / 60);
  const mins = total % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 < 12 ? "AM" : "PM";
  return `${hours12}:${mins.toString().padStart(2, "0")} ${ampm}`;
}

export function positionToVirtualMinutes(position: number): number {
  return position * MINUTES_PER_SQUARE;
}

export function positionToTimeString(position: number): string {
  return minutesToTimeString(positionToVirtualMinutes(position));
}

// ─── GRID LAYOUT ─────────────────────────────────────────────────────────────

// The board is a rectangular track rendered as a CSS grid.
// 122 squares split across 4 sides:
//   Bottom row →  30 squares  indices 0–29    (left to right)
//   Right col  ↑  31 squares  indices 30–60   (bottom to top, excluding corners)
//   Top row    ←  30 squares  indices 61–90   (right to left)
//   Left col   ↓  31 squares  indices 91–121  (top to bottom, excluding corners)
//
// Grid dimensions: 32 cols × 33 rows (30 edge squares + 2 corners per side,
// with a hollow center)

export const GRID_COLS = 32;
export const GRID_ROWS = 33;

export interface GridPosition {
  col: number; // 0-indexed
  row: number; // 0-indexed
}

export function squareToGridPosition(index: number): GridPosition {
  // Bottom row: 0–29, row = GRID_ROWS-1, col = index
  if (index <= 29) {
    return { col: index, row: GRID_ROWS - 1 };
  }
  // Right col: 30–60, col = GRID_COLS-1, row = GRID_ROWS-1-(index-29)
  if (index <= 60) {
    return { col: GRID_COLS - 1, row: GRID_ROWS - 1 - (index - 29) };
  }
  // Top row: 61–90, row = 0, col = GRID_COLS-1-(index-60)
  if (index <= 90) {
    return { col: GRID_COLS - 1 - (index - 60), row: 0 };
  }
  // Left col: 91–121, col = 0, row = index-90
  return { col: 0, row: index - 90 };
}
