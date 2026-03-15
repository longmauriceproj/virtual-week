import type { Task, EventCard } from "../types/game";

// ─── REGULAR TASKS (every day) ───────────────────────────────────────────────
// These are shown on the Start Card every day without re-instruction.
// All regular tasks are time-based — triggered by the virtual clock.

const REGULAR_TASKS: Task[] = [
  {
    id: "take-medication-breakfast",
    label: "Take medication at breakfast",
    type: "time-based",
    frequency: "regular",
    triggerVirtualMinutes: 90, // 8:30 AM
    description: "Take your morning medication with breakfast.",
  },
  {
    id: "take-medication-dinner",
    label: "Take medication at dinner",
    type: "time-based",
    frequency: "regular",
    triggerVirtualMinutes: 660, // 6:00 PM
    description: "Take your evening medication with dinner.",
  },
  {
    id: "use-inhaler-morning",
    label: "Use asthma inhaler at 11 AM",
    type: "time-based",
    frequency: "regular",
    triggerVirtualMinutes: 240, // 11:00 AM
    description: "Use your asthma inhaler as scheduled.",
  },
  {
    id: "use-inhaler-evening",
    label: "Use asthma inhaler at 9 PM",
    type: "time-based",
    frequency: "regular",
    triggerVirtualMinutes: 840, // 9:00 PM
    description: "Use your asthma inhaler before bed.",
  },
  {
    id: "test-lung-capacity-2min",
    label: "Test lung capacity (2-minute check)",
    type: "time-check",
    frequency: "regular",
    triggerStopwatchSeconds: 120,
    description: "Perform the lung capacity test at the 2-minute mark.",
  },
  {
    id: "test-lung-capacity-4min",
    label: "Test lung capacity (4-minute check)",
    type: "time-check",
    frequency: "regular",
    triggerStopwatchSeconds: 240,
    description: "Perform the lung capacity test at the 4-minute mark.",
  },
];

// ─── IRREGULAR TASKS ─────────────────────────────────────────────────────────
// Performed only on specific days. Split into time-based and event-based.

const IRREGULAR_TASKS: Task[] = [
  // ── Time-based ─────────────────────────────────────────────────────────────
  {
    id: "phone-bank-noon",
    label: "Phone bank at noon to arrange appointment",
    type: "time-based",
    frequency: "irregular",
    triggerVirtualMinutes: 300, // 12:00 PM
    activeDays: [1, 3, 5],
    description: "Call the bank to arrange an appointment.",
  },
  {
    id: "call-doctor-2pm",
    label: "Call doctor at 2 PM",
    type: "time-based",
    frequency: "irregular",
    triggerVirtualMinutes: 420, // 2:00 PM
    activeDays: [2, 4],
    description: "Phone the doctor to confirm your appointment.",
  },
  {
    id: "watch-news-6pm",
    label: "Watch evening news at 6 PM",
    type: "time-based",
    frequency: "irregular",
    triggerVirtualMinutes: 660, // 6:00 PM
    activeDays: [2, 6],
    description: "Tune in to the evening news broadcast.",
  },
  {
    id: "water-plants-8am",
    label: "Water the plants at 8 AM",
    type: "time-based",
    frequency: "irregular",
    triggerVirtualMinutes: 60, // 8:00 AM
    activeDays: [3, 7],
    description: "Water your houseplants before you head out.",
  },
  {
    id: "pay-bills-10am",
    label: "Pay bills at 10 AM",
    type: "time-based",
    frequency: "irregular",
    triggerVirtualMinutes: 180, // 10:00 AM
    activeDays: [4, 6],
    description: "Pay the monthly utility bills online.",
  },
  {
    id: "feed-cat-7pm",
    label: "Feed the cat at 7 PM",
    type: "time-based",
    frequency: "irregular",
    triggerVirtualMinutes: 720, // 7:00 PM
    activeDays: [1, 5, 7],
    description: "Give the cat its evening meal.",
  },

  // ── Event-based ────────────────────────────────────────────────────────────
  {
    id: "drop-dry-cleaning",
    label: "Drop in dry cleaning when you go shopping",
    type: "event-based",
    frequency: "irregular",
    triggerEventId: "event-shopping",
    activeDays: [1, 4],
    description: "Drop off the dry cleaning while at the shops.",
  },
  {
    id: "return-library-book",
    label: "Return library book borrowed by Brian",
    type: "event-based",
    frequency: "irregular",
    triggerEventId: "event-library",
    activeDays: [2, 5],
    description: "Return the book Brian borrowed from the library.",
  },
  {
    id: "buy-memory-stick",
    label: "Buy a new memory stick at the computer shop",
    type: "event-based",
    frequency: "irregular",
    triggerEventId: "event-computer-shop",
    activeDays: [3, 6],
    description: "Pick up a USB memory stick at the computer shop.",
  },
  {
    id: "pick-up-glasses",
    label: "Pick up new reading glasses from optician",
    type: "event-based",
    frequency: "irregular",
    triggerEventId: "event-optician",
    activeDays: [1, 6],
    description: "Collect your new reading glasses from the optician.",
  },
  {
    id: "give-heartworm-tablet",
    label: "Give monthly heartworm tablet to dog",
    type: "event-based",
    frequency: "irregular",
    triggerEventId: "event-vet",
    activeDays: [2, 7],
    description: "Administer the monthly heartworm tablet to your dog.",
  },
  {
    id: "put-casserole-in-oven",
    label: "Put the casserole in the oven when you return home",
    type: "event-based",
    frequency: "irregular",
    triggerEventId: "event-return-home",
    activeDays: [3, 5],
    description: "Put the prepared casserole into the oven when you get home.",
  },
  {
    id: "car-service",
    label: "Put car in for service at garage",
    type: "event-based",
    frequency: "irregular",
    triggerEventId: "event-garage",
    activeDays: [4, 7],
    description: "Drop the car off at the garage for its service.",
  },
];

// ─── ALL TASKS ────────────────────────────────────────────────────────────────
// Single export combining both lists — used by the store and Perform Task panel.

export const ALL_TASKS: Task[] = [...REGULAR_TASKS, ...IRREGULAR_TASKS];

// ─── DISTRACTOR TASKS ─────────────────────────────────────────────────────────
// Never active on any day. Only appear as lures in the Perform Task panel.
// Drawn from the same list each day so players can't memorise a fixed pool.

export const DISTRACTOR_TASKS: Task[] = [
  {
    id: "dist-defrost-freezer",
    label: "Defrost the freezer",
    type: "time-based",
    frequency: "irregular",
    activeDays: [],
  },
  {
    id: "dist-call-plumber",
    label: "Call the plumber",
    type: "time-based",
    frequency: "irregular",
    activeDays: [],
  },
  {
    id: "dist-hair-appointment",
    label: "Book a hair appointment",
    type: "event-based",
    frequency: "irregular",
    activeDays: [],
  },
  {
    id: "dist-collect-parcel",
    label: "Collect parcel from post office",
    type: "event-based",
    frequency: "irregular",
    activeDays: [],
  },
  {
    id: "dist-birthday-card",
    label: "Send birthday card to nephew",
    type: "time-based",
    frequency: "irregular",
    activeDays: [],
  },
  {
    id: "dist-car-insurance",
    label: "Renew car insurance",
    type: "time-based",
    frequency: "irregular",
    activeDays: [],
  },
  {
    id: "dist-recycling",
    label: "Take recycling to the depot",
    type: "event-based",
    frequency: "irregular",
    activeDays: [],
  },
  {
    id: "dist-cheque-book",
    label: "Order new cheque book",
    type: "time-based",
    frequency: "irregular",
    activeDays: [],
  },
];

// ─── EVENT CARDS ──────────────────────────────────────────────────────────────

export const ALL_EVENT_CARDS: EventCard[] = [
  {
    id: "event-shopping",
    title: "Going Shopping",
    description:
      "You head out to do your weekly grocery shopping at the local supermarket.",
    linkedTaskId: "drop-dry-cleaning",
    activities: [
      {
        id: "a1",
        label: "Buy groceries only",
        description: "Pick up your usual grocery list and head home.",
      },
      {
        id: "a2",
        label: "Visit the deli counter",
        description: "Browse the deli and pick up some fresh cold cuts.",
      },
      {
        id: "a3",
        label: "Check the specials aisle",
        description: "Take a detour through the specials to look for bargains.",
      },
    ],
  },
  {
    id: "event-library",
    title: "Visiting the Library",
    description:
      "You spend some time at the local library browsing books and periodicals.",
    linkedTaskId: "return-library-book",
    activities: [
      {
        id: "a1",
        label: "Browse new arrivals",
        description: "Have a look at the new books section.",
      },
      {
        id: "a2",
        label: "Read a newspaper",
        description: "Settle in with a newspaper in the reading area.",
      },
      {
        id: "a3",
        label: "Use the computer",
        description: "Use one of the library computers to check your email.",
      },
    ],
  },
  {
    id: "event-computer-shop",
    title: "At the Computer Shop",
    description: "You pop into the local computer and electronics store.",
    linkedTaskId: "buy-memory-stick",
    activities: [
      {
        id: "a1",
        label: "Browse the latest laptops",
        description: "Have a look at the new laptop range on display.",
      },
      {
        id: "a2",
        label: "Check out peripherals",
        description: "Browse keyboards, mice, and other accessories.",
      },
      {
        id: "a3",
        label: "Ask for a product recommendation",
        description: "Speak to a staff member about your tech needs.",
      },
    ],
  },
  {
    id: "event-optician",
    title: "At the Optician",
    description: "You visit your local optician for your appointment.",
    linkedTaskId: "pick-up-glasses",
    activities: [
      {
        id: "a1",
        label: "Browse new frames",
        description: "Try on a few frames while you wait.",
      },
      {
        id: "a2",
        label: "Ask about contact lenses",
        description: "Enquire about contact lens options.",
      },
      {
        id: "a3",
        label: "Read the information leaflets",
        description: "Have a read of the eye health leaflets on display.",
      },
    ],
  },
  {
    id: "event-vet",
    title: "At the Vet",
    description:
      "You bring your dog in for a routine check-up at the veterinary clinic.",
    linkedTaskId: "give-heartworm-tablet",
    activities: [
      {
        id: "a1",
        label: "Chat with the vet about diet",
        description: "Discuss your dog's current diet with the vet.",
      },
      {
        id: "a2",
        label: "Buy a new toy from the shop",
        description: "Pick up a chew toy from the vet's small shop.",
      },
      {
        id: "a3",
        label: "Read the pet health posters",
        description: "Browse the pet health posters in the waiting room.",
      },
    ],
  },
  {
    id: "event-return-home",
    title: "Returning Home",
    description: "You arrive back home after a busy morning out and about.",
    linkedTaskId: "put-casserole-in-oven",
    activities: [
      {
        id: "a1",
        label: "Put away shopping",
        description: "Unpack your bags and put everything away.",
      },
      {
        id: "a2",
        label: "Check the mail",
        description: "Sort through the letters and parcels that arrived.",
      },
      {
        id: "a3",
        label: "Make a cup of tea",
        description: "Sit down and relax with a well-earned cup of tea.",
      },
    ],
  },
  {
    id: "event-garage",
    title: "At the Garage",
    description: "You stop by the local mechanic's garage.",
    linkedTaskId: "car-service",
    activities: [
      {
        id: "a1",
        label: "Wait in the lounge",
        description: "Relax in the waiting area with a magazine.",
      },
      {
        id: "a2",
        label: "Walk to a nearby café",
        description: "Stroll to the café next door for a coffee.",
      },
      {
        id: "a3",
        label: "Chat with the mechanic",
        description: "Ask the mechanic about the work being done.",
      },
    ],
  },
  {
    id: "event-post-office",
    title: "At the Post Office",
    description: "You visit the post office to send some letters.",
    activities: [
      {
        id: "a1",
        label: "Buy stamps",
        description: "Purchase a book of first-class stamps.",
      },
      {
        id: "a2",
        label: "Send a registered parcel",
        description: "Post a tracked parcel to a friend.",
      },
      {
        id: "a3",
        label: "Check exchange rates",
        description: "Enquire about currency exchange for an upcoming trip.",
      },
    ],
  },
  {
    id: "event-cafe",
    title: "Coffee at the Café",
    description:
      "You treat yourself to a sit-down coffee at your favourite café.",
    activities: [
      {
        id: "a1",
        label: "Read a book",
        description: "Enjoy some quiet reading time with your coffee.",
      },
      {
        id: "a2",
        label: "People-watch",
        description: "Relax and watch the world go by through the window.",
      },
      {
        id: "a3",
        label: "Chat with the barista",
        description: "Have a friendly chat with the café owner.",
      },
    ],
  },
  {
    id: "event-park",
    title: "Walk in the Park",
    description: "You take a relaxing stroll through the local park.",
    activities: [
      {
        id: "a1",
        label: "Feed the ducks",
        description: "Stop by the pond and feed the ducks some bread.",
      },
      {
        id: "a2",
        label: "Sit on a bench",
        description: "Find a sunny bench and enjoy the fresh air.",
      },
      {
        id: "a3",
        label: "Do some light stretching",
        description: "Take the opportunity to do some gentle exercise.",
      },
    ],
  },
];

// ─── DIFFICULTY SCALING ───────────────────────────────────────────────────────

/**
 * Returns the active tasks for a given day and difficulty level.
 *
 * Difficulty gates how many irregular tasks are included on top of regulars:
 * - Level 1: regular tasks only
 * - Level 2: regular + 1 irregular
 * - Level 3: regular + 2 irregulars
 * - Level 4: regular + 3 irregulars
 * - Level 5: regular + all irregulars active that day
 *
 * @param day - The current day (1–7)
 * @param difficultyLevel - The current difficulty level (1–5)
 * @returns Array of tasks active for this day
 */
export function getTasksForDay(day: number, difficultyLevel: number): Task[] {
  const regulars = REGULAR_TASKS;

  const irregulars = IRREGULAR_TASKS.filter(
    (t) => t.activeDays && t.activeDays.includes(day),
  );

  const maxIrregular = Math.max(0, difficultyLevel - 1);
  const activeIrregulars = irregulars.slice(0, maxIrregular);

  return [...regulars, ...activeIrregulars];
}

/**
 * Computes the next difficulty level based on accuracy from the previous day.
 *
 * - greater or equal 80% accuracy → increase difficulty (if not already at max)
 * - less than 50% accuracy → decrease difficulty (if not already at min)
 * - otherwise → stay the same
 *
 * @param currentLevel - The current difficulty level (1–5)
 * @param accuracy - Accuracy from the previous day as a value between 0 and 1
 * @returns The next difficulty level (1–5)
 */
export function computeNextDifficulty(
  currentLevel: number,
  accuracy: number,
): number {
  if (accuracy >= 0.8 && currentLevel < 5) return currentLevel + 1;
  if (accuracy < 0.5 && currentLevel > 1) return currentLevel - 1;
  return currentLevel;
}

/**
 * Returns the pool of event cards to use for a given day.
 *
 * Ensures any cards linked to today's active event-based tasks are included
 * in the pool. Unlinked cards are rotated by day number so the same cards
 * don't appear every day. Always returns exactly 10 cards to match the
 * 10 event squares on the board.
 *
 * @param day - The current day (1–7), used to rotate the unlinked card pool
 * @param tasksForDay - The active tasks for this day, used to identify linked cards
 * @returns Array of 10 event cards for this day
 */
export function getEventCardsForDay(
  day: number,
  tasksForDay: Task[],
): EventCard[] {
  const linkedEventIds = new Set(
    tasksForDay
      .filter((t) => t.type === "event-based" && t.triggerEventId)
      .map((t) => t.triggerEventId!),
  );

  const linked = ALL_EVENT_CARDS.filter((e) => linkedEventIds.has(e.id));
  const unlinked = ALL_EVENT_CARDS.filter((e) => !linkedEventIds.has(e.id));

  // Rotate the unlinked pool by day so the same cards don't appear every day
  const rotated = [
    ...unlinked.slice(day % unlinked.length),
    ...unlinked.slice(0, day % unlinked.length),
  ];

  // We have 10 event squares per day — fill the pool accordingly
  const pool = [...linked, ...rotated];
  return Array.from({ length: 10 }, (_, i) => pool[i % pool.length]);
}
