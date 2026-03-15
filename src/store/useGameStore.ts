import { useReducer, useEffect, useRef } from 'react';
import type {
  GameState,
  CompletedTask,
  DayResult,
  TaskScore,
} from '../types/game';
import type { EventCard, Task } from '../types/game';
import {
  getTasksForDay,
  computeNextDifficulty,
  getEventCardsForDay,
  ALL_TASKS,
  DISTRACTOR_TASKS,
} from '../data/tasks';
import {
  EVENT_POSITIONS,
  TOTAL_SQUARES,
  positionToVirtualMinutes,
} from '../utils/board';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'virtual-week-state';
const TOTAL_DAYS = 7;

/** Virtual minutes window within which a time-based task is considered on-time */
const TIME_BASED_WINDOW_MINUTES = 15;

/** Real seconds window within which a time-check task is considered on-time */
const TIME_CHECK_WINDOW_SECONDS = 15;

// ─── INITIAL STATE ───────────────────────────────────────────────────────────

const INITIAL_STATE: GameState = {
  phase: 'setup',
  currentDay: 1,
  tokenPosition: 0,
  dieValue: null,
  isRolling: false,
  tasksForToday: [],
  completedTasksToday: [],
  missedTasksToday: [],
  completedEventsToday: [],
  pendingEventCard: null,
  pendingTaskPrompt: null,
  difficultyLevel: 1,
  dayResults: [],
  stopwatchSeconds: 0,
  performTaskOpenedAt: null,
  dismissedTimeChecks: [],
  passedTimeTriggers: [],
  triggeredTasks: [],
};

// ─── ACTIONS ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'START_GAME' }
  | { type: 'DISMISS_START_CARD' }
  | { type: 'ROLL_DIE' }
  | { type: 'SET_DIE_VALUE'; value: number }
  | { type: 'MOVE_TOKEN'; targetPosition: number }
  | { type: 'DISMISS_EVENT_CARD'; chosenActivityId: string }
  | { type: 'OPEN_PERFORM_TASK' }
  | { type: 'SUBMIT_TASK'; taskId: string }
  | { type: 'DISMISS_PERFORM_TASK' }
  | { type: 'TICK_STOPWATCH' }
  | { type: 'NEXT_DAY' }
  | { type: 'RESET_GAME' };

// ─── SCORING HELPERS ─────────────────────────────────────────────────────────

/**
 * Determines the TaskScore for a time-based task submission.
 *
 * @param taskId - The task being scored
 * @param triggeredTasks - Tasks that have been triggered this day
 * @param currentVirtualMinutes - Current virtual time in minutes
 * @returns TaskScore for this submission
 */
function scoreTimeBased(
  taskId: string,
  triggeredTasks: GameState['triggeredTasks'],
  currentVirtualMinutes: number,
): TaskScore {
  const triggered = triggeredTasks.find((t) => t.taskId === taskId);
  if (!triggered || triggered.triggeredAtMinutes === undefined)
    return 'incorrect';

  const elapsed = currentVirtualMinutes - triggered.triggeredAtMinutes;
  return elapsed <= TIME_BASED_WINDOW_MINUTES ? 'on-time' : 'late';
}

/**
 * Determines the TaskScore for a time-check task submission.
 *
 * @param taskId - The task being scored
 * @param triggeredTasks - Tasks that have been triggered this day
 * @param currentSeconds - Current stopwatch seconds
 * @returns TaskScore for this submission
 */
function scoreTimeCheck(
  taskId: string,
  triggeredTasks: GameState['triggeredTasks'],
  currentSeconds: number,
): TaskScore {
  const triggered = triggeredTasks.find((t) => t.taskId === taskId);
  if (!triggered || triggered.triggeredAtSeconds === undefined)
    return 'incorrect';

  const elapsed = currentSeconds - triggered.triggeredAtSeconds;
  return elapsed <= TIME_CHECK_WINDOW_SECONDS ? 'on-time' : 'late';
}

/**
 * Determines the TaskScore for an event-based task submission.
 *
 * On-time if the triggering event card is still open (pendingEventCard matches),
 * late if the card has already been dismissed.
 *
 * @param taskId - The task being scored
 * @param triggeredTasks - Tasks that have been triggered this day
 * @param pendingEventCard - The currently open event card, if any
 * @returns TaskScore for this submission
 */
function scoreEventBased(
  taskId: string,
  triggeredTasks: GameState['triggeredTasks'],
  pendingEventCard: EventCard | null,
): TaskScore {
  const triggered = triggeredTasks.find((t) => t.taskId === taskId);
  if (!triggered) return 'incorrect';

  // On-time only if the linked event card is still open
  const task = ALL_TASKS.find((t) => t.id === taskId);
  const isCardOpen =
    pendingEventCard?.linkedTaskId === taskId ||
    pendingEventCard?.id === task?.triggerEventId;

  return isCardOpen ? 'on-time' : 'late';
}

/**
 * Scores a task submission based on its type and current game state.
 *
 * @param taskId - The id of the task being submitted
 * @param state - Current game state
 * @returns TaskScore for this submission
 */
function scoreTask(taskId: string, state: GameState): TaskScore {
  const task = state.tasksForToday.find((t) => t.id === taskId);

  // Task not active today — always incorrect
  if (!task) return 'incorrect';

  // Already completed — always incorrect
  const alreadyDone = state.completedTasksToday.find(
    (c) => c.taskId === taskId,
  );
  if (alreadyDone) return 'incorrect';

  const currentVirtualMinutes = positionToVirtualMinutes(state.tokenPosition);

  switch (task.type) {
    case 'time-based':
      return scoreTimeBased(
        taskId,
        state.triggeredTasks,
        currentVirtualMinutes,
      );
    case 'time-check':
      return scoreTimeCheck(
        taskId,
        state.triggeredTasks,
        state.stopwatchSeconds,
      );
    case 'event-based':
      return scoreEventBased(
        taskId,
        state.triggeredTasks,
        state.pendingEventCard,
      );
    default:
      return 'incorrect';
  }
}

// ─── TRIGGER CHECKERS ────────────────────────────────────────────────────────

/**
 * Checks whether any time-based tasks trigger as the token moves from
 * its old position to a new position.
 *
 * Returns a partial state update if a trigger is found, otherwise null.
 *
 * @param state - Current game state
 * @param newPosition - The position the token is moving to
 */
function checkTimeTriggers(
  state: GameState,
  newPosition: number,
): Partial<GameState> | null {
  const oldMinutes = positionToVirtualMinutes(state.tokenPosition);
  const newMinutes = positionToVirtualMinutes(newPosition);

  for (const task of state.tasksForToday) {
    if (task.type !== 'time-based' || task.triggerVirtualMinutes === undefined)
      continue;

    const alreadyTriggered = state.passedTimeTriggers.includes(
      task.triggerVirtualMinutes,
    );
    const alreadyCompleted = state.completedTasksToday.find(
      (c) => c.taskId === task.id,
    );

    if (
      !alreadyTriggered &&
      !alreadyCompleted &&
      oldMinutes < task.triggerVirtualMinutes &&
      newMinutes >= task.triggerVirtualMinutes
    ) {
      return {
        pendingTaskPrompt: { reason: 'time-based', taskId: task.id },
        phase: 'perform-task',
        performTaskOpenedAt: Date.now(),
        passedTimeTriggers: [
          ...state.passedTimeTriggers,
          task.triggerVirtualMinutes,
        ],
        triggeredTasks: [
          ...state.triggeredTasks,
          {
            taskId: task.id,
            triggeredAtMinutes: task.triggerVirtualMinutes,
          },
        ],
      };
    }
  }

  return null;
}

/**
 * Checks whether any time-check tasks trigger at the current stopwatch time.
 *
 * Returns a partial state update if a trigger is found, otherwise null.
 *
 * @param state - Current game state
 * @param seconds - Current stopwatch seconds
 */
function checkStopwatchTrigger(
  state: GameState,
  seconds: number,
): Partial<GameState> | null {
  for (const task of state.tasksForToday) {
    if (
      task.type !== 'time-check' ||
      task.triggerStopwatchSeconds === undefined
    )
      continue;

    const alreadyTriggered = state.dismissedTimeChecks.includes(
      task.triggerStopwatchSeconds,
    );
    const alreadyCompleted = state.completedTasksToday.find(
      (c) => c.taskId === task.id,
    );

    if (
      !alreadyTriggered &&
      !alreadyCompleted &&
      seconds >= task.triggerStopwatchSeconds
    ) {
      return {
        pendingTaskPrompt: { reason: 'time-check', taskId: task.id },
        phase: 'perform-task',
        performTaskOpenedAt: Date.now(),
        dismissedTimeChecks: [
          ...state.dismissedTimeChecks,
          task.triggerStopwatchSeconds,
        ],
        triggeredTasks: [
          ...state.triggeredTasks,
          {
            taskId: task.id,
            triggeredAtSeconds: task.triggerStopwatchSeconds,
          },
        ],
      };
    }
  }

  return null;
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'RESET_GAME':
      return INITIAL_STATE;

    case 'START_GAME': {
      const tasks = getTasksForDay(1, 1);
      return {
        ...INITIAL_STATE,
        phase: 'start-card',
        currentDay: 1,
        tasksForToday: tasks,
        difficultyLevel: 1,
      };
    }

    case 'DISMISS_START_CARD':
      return { ...state, phase: 'playing' };

    case 'ROLL_DIE':
      if (state.isRolling || state.phase !== 'playing') return state;
      return { ...state, isRolling: true };

    case 'SET_DIE_VALUE':
      return { ...state, dieValue: action.value, isRolling: false };

    case 'MOVE_TOKEN': {
      const rawTarget = action.targetPosition;

      // Token completed a full circuit — end the day
      if (rawTarget >= TOTAL_SQUARES) {
        const newPosition = rawTarget % TOTAL_SQUARES;

        // Mark any triggered but unperformed tasks as missed
        const missedTaskIds = state.triggeredTasks
          .filter(
            (t) =>
              !state.completedTasksToday.find((c) => c.taskId === t.taskId),
          )
          .map((t) => t.taskId);

        const missedTasks: CompletedTask[] = missedTaskIds.map((taskId) => {
          const task = state.tasksForToday.find((t) => t.id === taskId)!;
          return {
            taskId,
            day: state.currentDay,
            virtualTime: '10:15 PM',
            score: 'missed' as TaskScore,
            reactionTimeMs: 0,
            triggerType: task.type,
          };
        });

        const allCompleted = [...state.completedTasksToday, ...missedTasks];
        const onTime = allCompleted.filter((t) => t.score === 'on-time').length;
        const late = allCompleted.filter((t) => t.score === 'late').length;
        const missed = allCompleted.filter((t) => t.score === 'missed').length;
        const incorrect = allCompleted.filter(
          (t) => t.score === 'incorrect',
        ).length;
        const total = state.tasksForToday.length;
        const accuracy = total > 0 ? onTime / total : 0;

        const result: DayResult = {
          day: state.currentDay,
          onTime,
          late,
          missed,
          incorrect,
          total,
          accuracy,
          difficultyLevel: state.difficultyLevel,
        };

        return {
          ...state,
          tokenPosition: newPosition,
          completedTasksToday: allCompleted,
          missedTasksToday: missedTaskIds,
          phase: 'day-summary',
          dayResults: [...state.dayResults, result],
        };
      }

      const newPosition = rawTarget;

      // Check time-based triggers before checking event squares
      const timeTrigger = checkTimeTriggers(state, newPosition);
      if (timeTrigger) {
        return { ...state, tokenPosition: newPosition, ...timeTrigger };
      }

      // Check if landed on an event square
      if (EVENT_POSITIONS.has(newPosition)) {
        const eventCards = getEventCardsForDay(
          state.currentDay,
          state.tasksForToday,
        );
        const eventSquareIndex =
          Array.from(EVENT_POSITIONS).indexOf(newPosition);
        const card = eventCards[eventSquareIndex % eventCards.length];

        // Check if this card's linked task is already completed
        const linkedTaskDone =
          card.linkedTaskId &&
          state.completedTasksToday.find((c) => c.taskId === card.linkedTaskId);

        // If the linked task is not yet completed, add it to triggeredTasks
        const newTriggeredTasks =
          card.linkedTaskId && !linkedTaskDone
            ? [
                ...state.triggeredTasks,
                {
                  taskId: card.linkedTaskId,
                  triggeredAtPosition: newPosition,
                },
              ]
            : state.triggeredTasks;

        return {
          ...state,
          tokenPosition: newPosition,
          pendingEventCard: card,
          phase: 'event-card',
          triggeredTasks: newTriggeredTasks,
        };
      }

      return { ...state, tokenPosition: newPosition };
    }

    case 'DISMISS_EVENT_CARD': {
      const card = state.pendingEventCard;
      if (!card) return { ...state, phase: 'playing' };

      const completedEvent = {
        eventId: card.id,
        day: state.currentDay,
        chosenActivityId: action.chosenActivityId,
      };

      // Check if this card triggers an event-based task that hasn't been done
      const linkedTask = card.linkedTaskId
        ? state.tasksForToday.find((t) => t.id === card.linkedTaskId)
        : null;
      const linkedTaskDone = card.linkedTaskId
        ? state.completedTasksToday.find((c) => c.taskId === card.linkedTaskId)
        : null;

      if (linkedTask && !linkedTaskDone) {
        // Prompt the player to perform the linked task
        return {
          ...state,
          completedEventsToday: [...state.completedEventsToday, completedEvent],
          phase: 'perform-task',
          performTaskOpenedAt: Date.now(),
          pendingTaskPrompt: {
            reason: 'event-based',
            taskId: linkedTask.id,
          },
        };
      }

      return {
        ...state,
        completedEventsToday: [...state.completedEventsToday, completedEvent],
        pendingEventCard: null,
        phase: 'playing',
      };
    }

    case 'OPEN_PERFORM_TASK':
      if (state.phase !== 'playing') return state;
      return {
        ...state,
        phase: 'perform-task',
        performTaskOpenedAt: Date.now(),
        pendingTaskPrompt: { reason: 'time-based' },
      };

    case 'SUBMIT_TASK': {
      const openedAt = state.performTaskOpenedAt ?? Date.now();
      const reactionTimeMs = Date.now() - openedAt;
      const task =
        state.tasksForToday.find((t) => t.id === action.taskId) ??
        ALL_TASKS.find((t) => t.id === action.taskId);

      const score = scoreTask(action.taskId, state);

      const completedTask: CompletedTask = {
        taskId: action.taskId,
        day: state.currentDay,
        virtualTime: `${positionToVirtualMinutes(state.tokenPosition)} min`,
        score,
        reactionTimeMs,
        triggerType: task?.type ?? 'time-based',
      };

      return {
        ...state,
        completedTasksToday: [...state.completedTasksToday, completedTask],
        pendingTaskPrompt: null,
        pendingEventCard: null,
        phase: 'playing',
        performTaskOpenedAt: null,
      };
    }

    case 'DISMISS_PERFORM_TASK':
      return {
        ...state,
        pendingTaskPrompt: null,
        phase: 'playing',
        performTaskOpenedAt: null,
      };

    case 'TICK_STOPWATCH': {
      if (state.phase !== 'playing') return state;
      const newSeconds = state.stopwatchSeconds + 1;
      const trigger = checkStopwatchTrigger(state, newSeconds);
      if (trigger) {
        return { ...state, stopwatchSeconds: newSeconds, ...trigger };
      }
      return { ...state, stopwatchSeconds: newSeconds };
    }

    case 'NEXT_DAY': {
      const lastResult = state.dayResults[state.dayResults.length - 1];
      const nextDifficulty = lastResult
        ? computeNextDifficulty(state.difficultyLevel, lastResult.accuracy)
        : state.difficultyLevel;

      const nextDay = state.currentDay + 1;

      if (nextDay > TOTAL_DAYS) {
        return { ...state, phase: 'game-over' };
      }

      const nextTasks = getTasksForDay(nextDay, nextDifficulty);

      return {
        ...state,
        phase: 'start-card',
        currentDay: nextDay,
        tokenPosition: 0,
        dieValue: null,
        isRolling: false,
        tasksForToday: nextTasks,
        completedTasksToday: [],
        missedTasksToday: [],
        completedEventsToday: [],
        pendingEventCard: null,
        pendingTaskPrompt: null,
        difficultyLevel: nextDifficulty,
        stopwatchSeconds: 0,
        performTaskOpenedAt: null,
        dismissedTimeChecks: [],
        passedTimeTriggers: [],
        triggeredTasks: [],
      };
    }

    default:
      return state;
  }
}

// ─── HOOK ────────────────────────────────────────────────────────────────────

/**
 * Returns the shuffled list of tasks shown in the Perform Task panel.
 *
 * Combines today's active tasks with 4 randomly selected distractors,
 * then shuffles the combined list. Distractors are drawn from the full
 * task pool minus today's active tasks so the pool varies each day.
 *
 * @param state - Current game state
 * @returns Shuffled array of tasks and distractors
 */
function getPerformTaskOptions(state: GameState): Task[] {
  const todayIds = new Set(state.tasksForToday.map((t) => t.id));

  // Draw distractors from tasks not active today
  const distractorPool = [
    ...ALL_TASKS.filter((t) => !todayIds.has(t.id)),
    ...DISTRACTOR_TASKS,
  ];

  // Seed shuffle by day and position to vary the distractors each turn
  const seed = state.currentDay * 100 + state.tokenPosition;
  const shuffledDistractors = distractorPool
    .map((t, i) => ({ t, sort: (i * seed * 9301 + 49297) % 233280 }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.t)
    .slice(0, 4);

  const options = [...state.tasksForToday, ...shuffledDistractors];

  return options
    .map((t, i) => ({ t, sort: ((i + 1) * seed * 6364 + 1442695) % 999983 }))
    .sort((a, b) => a.sort - b.sort)
    .map((x) => x.t);
}

/**
 * Main game store hook. Wires up the reducer, localStorage persistence,
 * stopwatch ticker, and exposes the perform task options helper.
 *
 * State is persisted to localStorage on every change so the game can be
 * resumed after a page refresh.
 *
 * @returns state, dispatch, and getPerformTaskOptions
 */
export function useGameStore() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (init) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GameState;
        return { ...parsed, isRolling: false };
      }
    } catch {
      // Ignore malformed localStorage data
    }
    return init;
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Stopwatch ticker — only runs during active play
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase === 'playing') {
      tickRef.current = setInterval(() => {
        dispatch({ type: 'TICK_STOPWATCH' });
      }, 1000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase]);

  return {
    state,
    dispatch,
    performTaskOptions: getPerformTaskOptions(state),
  };
}
