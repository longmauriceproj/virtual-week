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

/**
 * Builds the full array of board squares for one circuit of the track.
 *
 * Each square is assigned an index (0–121), a type (start, event, or normal),
 * and the virtual time in minutes since 7:00 AM that it represents.
 *
 * @returns Array of 122 BoardSquare objects in track order
 */
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

/**
 * Converts a number of minutes since 7:00 AM into a human-readable time string.
 *
 * @example
 * minutesToTimeString(90)  // "8:30 AM"
 * minutesToTimeString(300) // "12:00 PM"
 * minutesToTimeString(840) // "9:00 PM"
 *
 * @param minutes - Minutes elapsed since 7:00 AM
 * @returns Formatted time string in 12-hour format e.g. "9:30 AM"
 */
export function minutesToTimeString(minutes: number): string {
  const total = Math.round(minutes);
  const hours24 = 7 + Math.floor(total / 60);
  const mins = total % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const ampm = hours24 < 12 ? "AM" : "PM";
  return `${hours12}:${mins.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Converts a board position (square index) to virtual minutes since 7:00 AM.
 *
 * @param position - Square index (0–121)
 * @returns Minutes elapsed since 7:00 AM
 */
export function positionToVirtualMinutes(position: number): number {
  return position * MINUTES_PER_SQUARE;
}

/**
 * Converts a board position (square index) to a human-readable time string.
 *
 * Combines positionToVirtualMinutes and minutesToTimeString.
 *
 * @example
 * positionToTimeString(0)   // "7:00 AM"
 * positionToTimeString(61)  // "12:37 PM" (roughly noon)
 * positionToTimeString(121) // "10:07 PM"
 *
 * @param position - Square index (0–121)
 * @returns Formatted time string in 12-hour format e.g. "9:30 AM"
 */
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

/**
 * Maps a square index to its (col, row) position in the CSS grid.
 *
 * The board track runs clockwise starting from position 0 at the bottom-left:
 * - Bottom row →  indices 0–29    (left to right,  row = GRID_ROWS-1)
 * - Right col  ↑  indices 30–60   (bottom to top,  col = GRID_COLS-1)
 * - Top row    ←  indices 61–90   (right to left,  row = 0)
 * - Left col   ↓  indices 91–121  (top to bottom,  col = 0)
 *
 * @param index - Square index (0–121)
 * @returns GridPosition with zero-indexed col and row values
 */
export function squareToGridPosition(index: number): GridPosition {
  if (index <= 29) {
    return { col: index, row: GRID_ROWS - 1 };
  }
  if (index <= 60) {
    return { col: GRID_COLS - 1, row: GRID_ROWS - 1 - (index - 29) };
  }
  if (index <= 90) {
    return { col: GRID_COLS - 1 - (index - 60), row: 0 };
  }
  return { col: 0, row: index - 90 };
}
