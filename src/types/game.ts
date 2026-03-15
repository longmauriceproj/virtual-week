// ─── BOARD ───────────────────────────────────────────────────────────────────

export type GamePhase =
  | "setup"
  | "start-card"
  | "playing"
  | "event-card"
  | "perform-task"
  | "day-summary"
  | "game-over";

export type SquareType = "normal" | "event" | "start";

export type TaskType = "time-based" | "event-based" | "time-check";

export type TaskFrequency = "regular" | "irregular";

/**
 * Represents how timely a task was performed.
 *
 * - on-time: performed within the correct trigger window
 * - late:    performed after the trigger window but before end of day
 * - missed:  never performed before end of day
 * - incorrect: performed but the wrong task was selected
 */
export type TaskScore = "on-time" | "late" | "missed" | "incorrect";

// ─── BOARD SQUARE ────────────────────────────────────────────────────────────

export interface BoardSquare {
  index: number;
  type: SquareType;
  virtualMinutes: number;
  label?: string;
}

// ─── TASKS ───────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  label: string;
  type: TaskType;
  frequency: TaskFrequency;
  description?: string;
  triggerVirtualMinutes?: number;
  triggerEventId?: string;
  triggerStopwatchSeconds?: number;
  activeDays?: number[];
}

// ─── EVENT CARDS ─────────────────────────────────────────────────────────────

export interface EventCardActivity {
  id: string;
  label: string;
  description: string;
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  activities: EventCardActivity[];
  linkedTaskId?: string;
}

// ─── RESULTS & LOGGING ───────────────────────────────────────────────────────

export interface CompletedTask {
  taskId: string;
  day: number;
  virtualTime: string;
  score: TaskScore; // replaces the boolean `correct`
  reactionTimeMs: number;
  triggerType: TaskType;
}

export interface CompletedEvent {
  eventId: string;
  day: number;
  chosenActivityId: string;
}

export interface DayResult {
  day: number;
  onTime: number; // tasks scored on-time
  late: number; // tasks scored late
  missed: number; // tasks never attempted
  incorrect: number; // tasks attempted with wrong selection
  total: number; // total tasks that were active this day
  accuracy: number; // on-time / total, the primary performance metric
  difficultyLevel: number;
}

// ─── GAME STATE ──────────────────────────────────────────────────────────────

export interface GameState {
  phase: GamePhase;
  currentDay: number;
  tokenPosition: number;
  dieValue: number | null;
  isRolling: boolean;

  tasksForToday: Task[];
  completedTasksToday: CompletedTask[];
  missedTasksToday: string[];
  completedEventsToday: CompletedEvent[];

  pendingEventCard: EventCard | null;
  pendingTaskPrompt: {
    reason: "time-based" | "event-based" | "time-check";
    taskId?: string;
  } | null;

  difficultyLevel: number;
  dayResults: DayResult[];

  stopwatchSeconds: number;
  performTaskOpenedAt: number | null;

  dismissedTimeChecks: number[];
  passedTimeTriggers: number[];
}
