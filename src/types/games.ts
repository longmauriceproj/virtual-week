// ─── BOARD ───────────────────────────────────────────────────────────────────

// The phase the game is currently in — drives which screen/modal is shown
export type GamePhase =
  | "setup" // Landing screen before game starts
  | "start-card" // Day instructions modal shown at start of each day
  | "playing" // Main game loop — rolling and moving
  | "event-card" // Player landed on an E square, event modal is open
  | "perform-task" // Perform Task panel is open
  | "day-summary" // End of day results screen
  | "game-over"; // All 7 days complete

// The three square types on the board track
export type SquareType =
  | "normal" // Plain square, no special action
  | "event" // Green E square — triggers an EventCard when landed on
  | "start"; // The single start position where the token begins each day

// The three PM task types from the Rendell & Craik paradigm
export type TaskType =
  | "time-based" // Triggered when virtual clock reaches a specific time
  | "event-based" // Triggered when a specific event card is drawn
  | "time-check"; // Triggered when real elapsed stopwatch reaches a set time

// Whether a task recurs every day or only on specific days
export type TaskFrequency =
  | "regular" // Performed every day without re-instruction
  | "irregular"; // Only on specific days (listed in activeDays)

// ─── BOARD SQUARE ────────────────────────────────────────────────────────────

export interface BoardSquare {
  index: number; // Position on the track (0–51)
  type: SquareType;
  virtualMinutes: number; // Minutes since 7:00 AM this square represents
  label?: string; // Optional display label (e.g. time markers)
}

// ─── TASKS ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  label: string; // What the player sees in the Perform Task list
  type: TaskType;
  frequency: TaskFrequency;
  description?: string; // Longer description shown on the Start Card

  // Time-based: virtual minutes since 7 AM when this triggers
  triggerVirtualMinutes?: number;

  // Event-based: the EventCard id that triggers this task
  triggerEventId?: string;

  // Time-check: real elapsed seconds since day start when this triggers
  triggerStopwatchSeconds?: number;

  // Which days (1–7) this task is active. Omit or empty = every day (regular)
  activeDays?: number[];
}

// ─── EVENT CARDS ─────────────────────────────────────────────────────────────

// One of the three activity choices shown on an event card
export interface EventCardActivity {
  id: string;
  label: string;
  description: string;
}

export interface EventCard {
  id: string;
  title: string;
  description: string; // Narrative shown to the player
  activities: EventCardActivity[]; // Always 3 choices
  linkedTaskId?: string; // If set, drawing this card triggers that task
}

// ─── RESULTS & LOGGING ───────────────────────────────────────────────────────

// One completed (or incorrectly attempted) task during a day
export interface CompletedTask {
  taskId: string;
  day: number;
  virtualTime: string; // Human-readable virtual time when performed
  correct: boolean; // Was the right task selected?
  reactionTimeMs: number; // Ms between panel opening and submission
  triggerType: TaskType;
}

// One event card interaction during a day
export interface CompletedEvent {
  eventId: string;
  day: number;
  chosenActivityId: string;
}

// End-of-day rolled-up result — used for DaySummary and GameOver screens
export interface DayResult {
  day: number;
  tasksAttempted: number;
  tasksCorrect: number;
  tasksMissed: number; // Tasks that triggered but were never performed
  accuracy: number; // 0–1, tasksCorrect / total tasks for the day
  difficultyLevel: number; // The difficulty level active during this day
}

// ─── GAME STATE ──────────────────────────────────────────────────────────────

export interface GameState {
  phase: GamePhase;
  currentDay: number; // 1–7
  tokenPosition: number; // 0–51, current position on the board track
  dieValue: number | null; // null = not yet rolled this turn
  isRolling: boolean; // True during the die animation

  tasksForToday: Task[];
  completedTasksToday: CompletedTask[];
  missedTasksToday: string[]; // Task ids that were missed
  completedEventsToday: CompletedEvent[];

  pendingEventCard: EventCard | null; // The card waiting to be dismissed
  pendingTaskPrompt: {
    // What triggered the Perform Task panel
    reason: "time-based" | "event-based" | "time-check";
    taskId?: string; // The specific task that should be performed
  } | null;

  difficultyLevel: number; // 1–5, adapts based on prior day accuracy
  dayResults: DayResult[]; // Accumulated across all days

  stopwatchSeconds: number; // Real elapsed seconds since this day started
  performTaskOpenedAt: number | null; // Date.now() when panel opened, for reaction time

  // Guards to prevent the same trigger firing twice in one day
  dismissedTimeChecks: number[]; // Stopwatch seconds already triggered
  passedTimeTriggers: number[]; // Virtual minute thresholds already crossed
}
