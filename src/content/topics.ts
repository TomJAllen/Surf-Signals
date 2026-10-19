// The three topics the app covers, and the tests for each.
// Learn, Test and the dashboard all read from here so they stay in step.
// An exercise without an href is shown as "Coming soon".

export type TopicId = "signals" | "acronyms" | "radio";

export interface Exercise {
  title: string;
  description: string;
  href?: string;
}

export interface Topic {
  id: TopicId;
  title: string;
  blurb: string;
  learnHref: string;
  testHref: string;
  exercises: Exercise[];
}

export const TOPICS: Topic[] = [
  {
    id: "signals",
    title: "Signals",
    blurb: "The 14 beach and water hand signals.",
    learnHref: "/learn/signals",
    testHref: "/test/signals",
    exercises: [
      {
        title: "Identify",
        description: "See a signal and pick its name.",
        href: "/study/identify",
      },
      {
        title: "Perform",
        description: "Do each signal in front of your camera and get instant feedback.",
        href: "/study/perform",
      },
      {
        title: "Which signal?",
        description: "Read a patrol situation and choose the signal you'd give.",
      },
    ],
  },
  {
    id: "acronyms",
    title: "Acronyms",
    blurb: "DRSABCD, SAMPLE, IMIST AMBO and the other memory aids.",
    learnHref: "/learn/acronyms",
    testHref: "/test/acronyms",
    exercises: [
      {
        title: "Mixed quiz",
        description: "Letters from every acronym, shuffled together.",
        href: "/test/acronyms/mixed",
      },
      {
        title: "One acronym at a time",
        description: "Quiz each letter, then drag real statements onto the right letter.",
        href: "/test/acronyms#all",
      },
      {
        title: "Timed recall",
        description: "Type out a whole acronym from memory against the clock.",
      },
      {
        title: "First aid scenarios",
        description: "Work through a patient: what to check, what to ask, what to do.",
      },
    ],
  },
  {
    id: "radio",
    title: "Radio",
    blurb: "Prowords, the phonetic alphabet and making calls.",
    learnHref: "/learn/radio",
    testHref: "/test/radio",
    exercises: [
      {
        title: "Prowords",
        description: "Match prowords to what they mean, both ways round.",
        href: "/test/radio/prowords",
      },
      {
        title: "Phonetic letters",
        description: "Match each letter to its phonetic word: Alpha, Bravo, Charlie…",
        href: "/test/radio/phonetic",
      },
      {
        title: "Spell it",
        description: "Type out call signs and words in the phonetic alphabet.",
        href: "/test/radio/spell",
      },
      {
        title: "Build the call",
        description: "Put a radio exchange in the right order.",
        href: "/test/radio/calls",
      },
      {
        title: "Listen and respond",
        description: "Hear an incoming call and choose the right reply.",
      },
    ],
  },
];

export function getTopic(id: TopicId): Topic {
  return TOPICS.find((t) => t.id === id)!;
}
