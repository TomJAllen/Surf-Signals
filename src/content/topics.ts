// The three topics the app covers, and the practice exercises for each.
// Learn, Practice and the dashboard all read from here so they stay in step.
// An exercise without an href is shown as "Coming soon".

export type TopicId = "signals" | "mnemonics" | "radio";

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
  exercises: Exercise[];
}

export const TOPICS: Topic[] = [
  {
    id: "signals",
    title: "Signals",
    blurb: "The 14 beach and water hand signals.",
    learnHref: "/learn/signals",
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
    id: "mnemonics",
    title: "Mnemonics",
    blurb: "DRSABCD, SAMPLE, IMIST AMBO and the other memory aids.",
    learnHref: "/learn/mnemonics",
    exercises: [
      {
        title: "Mixed quiz",
        description: "Letters from every mnemonic, shuffled together.",
        href: "/practice/mnemonics/mixed",
      },
      {
        title: "One mnemonic at a time",
        description: "Quiz each letter, then drag real statements onto the right letter.",
        href: "/practice/mnemonics",
      },
      {
        title: "Timed recall",
        description: "Type out a whole mnemonic from memory against the clock.",
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
    exercises: [
      {
        title: "Prowords",
        description: "Match prowords to what they mean, both ways round.",
        href: "/practice/radio?tab=prowords",
      },
      {
        title: "Phonetic letters",
        description: "Match each letter to its phonetic word: Alpha, Bravo, Charlie…",
        href: "/practice/radio?tab=phonetic",
      },
      {
        title: "Spell it",
        description: "Type out call signs and words in the phonetic alphabet.",
        href: "/practice/radio?tab=spell",
      },
      {
        title: "Build the call",
        description: "Put a radio exchange in the right order.",
        href: "/practice/radio?tab=calls",
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
