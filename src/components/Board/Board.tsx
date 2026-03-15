import {
  buildBoard,
  squareToGridPosition,
  GRID_COLS,
  GRID_ROWS,
} from '../../utils/board';
import type { BoardSquare } from '../../types/game';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

/** Pixel size of each square on the board */
const SQUARE_SIZE = 28;

/** Pixel gap between squares */
const SQUARE_GAP = 2;

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

interface SquareProps {
  square: BoardSquare;
  isToken: boolean;
}

function Square({ square, isToken }: SquareProps) {
  const base =
    'relative flex items-center justify-center rounded-sm border select-none';

  const typeStyles: Record<string, string> = {
    start: 'bg-emerald-100 border-emerald-400',
    event: 'bg-green-200 border-green-400 font-black text-green-800 text-xs',
    normal: 'bg-white border-slate-200',
  };

  return (
    <div
      className={`${base} ${typeStyles[square.type]}`}
      style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}
    >
      {square.type === 'event' && (
        <span className="text-[10px] font-black text-green-800 leading-none">
          E
        </span>
      )}
      {square.type === 'start' && (
        <span className="text-[8px] font-bold text-emerald-700 leading-none">
          GO
        </span>
      )}
      {isToken && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="rounded-full bg-blue-600 shadow-md shadow-blue-400/50 border-2 border-white"
            style={{ width: 14, height: 14 }}
          />
        </div>
      )}
    </div>
  );
}

interface CornerButtonProps {
  label: string;
  icon: string;
  color: string;
  onClick?: () => void;
  disabled?: boolean;
}

function CornerButton({
  label,
  icon,
  color,
  onClick,
  disabled,
}: CornerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center gap-1 rounded-xl border-2
        font-semibold text-white text-xs text-center leading-tight
        transition-all shadow-md active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed
        ${color}
      `}
      style={{ width: SQUARE_SIZE * 4, height: SQUARE_SIZE * 4 }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="px-1">{label}</span>
    </button>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface BoardProps {
  tokenPosition: number;
  onStartCard: () => void;
  onEventCard: () => void;
  onPerformTask: () => void;
  onPauseQuit: () => void;
  canPerformTask: boolean;
  children?: React.ReactNode; // die + game info rendered in center
}

const board = buildBoard();

export default function Board({
  tokenPosition,
  onStartCard,
  onEventCard,
  onPerformTask,
  onPauseQuit,
  canPerformTask,
  children,
}: BoardProps) {
  // Build a lookup map from "col,row" → BoardSquare for fast rendering
  const squareMap = new Map<string, BoardSquare>();
  for (const sq of board) {
    const { col, row } = squareToGridPosition(sq.index);
    squareMap.set(`${col},${row}`, sq);
  }

  const boardPixelWidth =
    GRID_COLS * SQUARE_SIZE + (GRID_COLS - 1) * SQUARE_GAP;
  const boardPixelHeight =
    GRID_ROWS * SQUARE_SIZE + (GRID_ROWS - 1) * SQUARE_GAP;

  // Inner content area bounds (inside the track)
  const innerLeft = 1 * (SQUARE_SIZE + SQUARE_GAP);
  const innerTop = 1 * (SQUARE_SIZE + SQUARE_GAP);
  const innerWidth = (GRID_COLS - 2) * (SQUARE_SIZE + SQUARE_GAP) - SQUARE_GAP;
  const innerHeight = (GRID_ROWS - 2) * (SQUARE_SIZE + SQUARE_GAP) - SQUARE_GAP;

  // Corner button pixel positions (just inside the track corners)
  const buttonSize = SQUARE_SIZE * 4;
  const cornerOffset = SQUARE_SIZE + SQUARE_GAP;

  const cornerPositions = {
    topLeft: { left: cornerOffset, top: cornerOffset },
    topRight: {
      left: boardPixelWidth - cornerOffset - buttonSize,
      top: cornerOffset,
    },
    bottomLeft: {
      left: cornerOffset,
      top: boardPixelHeight - cornerOffset - buttonSize,
    },
    bottomRight: {
      left: boardPixelWidth - cornerOffset - buttonSize,
      top: boardPixelHeight - cornerOffset - buttonSize,
    },
  };

  return (
    <div
      className="relative bg-slate-50 rounded-2xl border border-slate-200 shadow-lg p-2"
      style={{ width: boardPixelWidth + 16, height: boardPixelHeight + 16 }}
    >
      {/* Board squares */}
      <div
        className="relative"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, ${SQUARE_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${SQUARE_SIZE}px)`,
          gap: SQUARE_GAP,
        }}
      >
        {Array.from({ length: GRID_ROWS }, (_, row) =>
          Array.from({ length: GRID_COLS }, (_, col) => {
            const sq = squareMap.get(`${col},${row}`);
            const isInner =
              row > 0 && row < GRID_ROWS - 1 && col > 0 && col < GRID_COLS - 1;

            // Inner cells that aren't squares — render empty placeholder
            if (isInner && !sq) {
              return (
                <div
                  key={`${col}-${row}`}
                  style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}
                />
              );
            }

            if (!sq) return null;

            return (
              <Square
                key={sq.index}
                square={sq}
                isToken={sq.index === tokenPosition}
              />
            );
          }),
        )}
      </div>

      {/* Corner buttons — absolutely positioned inside the track */}
      <div
        className="absolute"
        style={{
          left: cornerPositions.topLeft.left + 8,
          top: cornerPositions.topLeft.top + 8,
        }}
      >
        <CornerButton
          label="Start Card"
          icon="📅"
          color="bg-sky-500 border-sky-600 hover:bg-sky-400"
          onClick={onStartCard}
        />
      </div>

      <div
        className="absolute"
        style={{
          left: cornerPositions.topRight.left + 8,
          top: cornerPositions.topRight.top + 8,
        }}
      >
        <CornerButton
          label="Perform Task"
          icon="✅"
          color="bg-violet-500 border-violet-600 hover:bg-violet-400"
          onClick={onPerformTask}
          disabled={!canPerformTask}
        />
      </div>

      <div
        className="absolute"
        style={{
          left: cornerPositions.bottomLeft.left + 8,
          top: cornerPositions.bottomLeft.top + 8,
        }}
      >
        <CornerButton
          label="Event Card"
          icon="📋"
          color="bg-amber-500 border-amber-600 hover:bg-amber-400"
          onClick={onEventCard}
        />
      </div>

      <div
        className="absolute"
        style={{
          left: cornerPositions.bottomRight.left + 8,
          top: cornerPositions.bottomRight.top + 8,
        }}
      >
        <CornerButton
          label="Pause or Quit"
          icon="⏸️"
          color="bg-slate-500 border-slate-600 hover:bg-slate-400"
          onClick={onPauseQuit}
        />
      </div>

      {/* Center content — die, clocks, game info */}
      <div
        className="absolute flex flex-col items-center justify-center gap-4"
        style={{
          left: innerLeft + 8 + buttonSize + SQUARE_GAP * 2,
          top: innerTop + 8 + buttonSize + SQUARE_GAP * 2,
          width: innerWidth - buttonSize * 2 - SQUARE_GAP * 4,
          height: innerHeight - buttonSize * 2 - SQUARE_GAP * 4,
        }}
      >
        {children}
      </div>
    </div>
  );
}
