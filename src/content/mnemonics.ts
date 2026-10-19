// Mnemonics taught in the SLSA Public Safety and Aquatic Rescue (PSAR) Training Manual,
// 35th edition. Wording is our own summary of the manual; check it against the latest
// edition (https://sls.com.au/psar35) when it changes.

export interface MnemonicItem {
  letter: string;
  term: string;
  detail: string;
}

// A fact from a scenario and the index of the item (letter) it belongs under
export interface SortFact {
  text: string;
  item: number;
}

export interface SortScenario {
  intro: string;
  facts: SortFact[];
}

export type MnemonicGroup = "handover" | "first-aid" | "patrol";

export interface Mnemonic {
  slug: string;
  name: string; // as written, e.g. "IMIST AMBO"
  title: string; // what it's for, e.g. "Ambulance handover"
  group: MnemonicGroup;
  when: string; // one line: when you use it
  items: MnemonicItem[];
  note?: string;
  source: string; // manual module / page
  sort?: SortScenario;
}

export const MNEMONIC_GROUPS: Record<MnemonicGroup, { label: string; blurb: string }> = {
  handover: {
    label: "Assessment and handover",
    blurb: "Checking a patient and handing them over to paramedics.",
  },
  "first-aid": {
    label: "First aid",
    blurb: "Recognising and treating common conditions.",
  },
  patrol: {
    label: "Patrol and team",
    blurb: "Being fit for duty and working well with others.",
  },
};

export const MNEMONICS: Mnemonic[] = [
  {
    slug: "drsabcd",
    name: "DRSABCD",
    title: "Primary assessment",
    group: "handover",
    when: "The first check of any patient, to find and deal with life-threatening problems in order.",
    items: [
      { letter: "D", term: "Danger", detail: "Check for danger to yourself, bystanders and the patient before you approach." },
      { letter: "R", term: "Response", detail: "Check if the patient responds to your voice and touch." },
      { letter: "S", term: "Send for help", detail: "Call for help: radio your state communication centre or call 000, and ask for oxygen and an AED." },
      { letter: "A", term: "Airway", detail: "Open the airway and clear anything blocking it." },
      { letter: "B", term: "Breathing", detail: "Look, listen and feel for normal breathing." },
      { letter: "C", term: "CPR", detail: "Start CPR if they are unresponsive and not breathing normally." },
      { letter: "D", term: "Defibrillation", detail: "Attach an AED as soon as one is available and follow its prompts." },
    ],
    note: "For an uncomplicated patient, D-R-S-A-B can often be done in under 15 seconds.",
    source: "Module 6 – Resuscitation",
  },
  {
    slug: "sample",
    name: "SAMPLE",
    title: "Secondary assessment",
    group: "handover",
    when: "Questions to ask a conscious patient once they're stable, recorded on the incident report.",
    items: [
      { letter: "S", term: "Signs and symptoms", detail: "Signs are what you see, hear and smell; symptoms are what they tell you they feel." },
      { letter: "A", term: "Allergies", detail: "Any allergies to medication, food, stings or anything else." },
      { letter: "M", term: "Medications", detail: "Any medicines they take or have taken today." },
      { letter: "P", term: "Past medical history", detail: "Relevant conditions, operations or previous problems." },
      { letter: "L", term: "Last oral intake", detail: "When they last ate or drank, and what." },
      { letter: "E", term: "Events leading up", detail: "What happened before the illness or injury." },
    ],
    source: "Module 7 – Emergency Care",
    sort: {
      intro: "A surfer comes up the beach holding their ankle. Sort what you find out into SAMPLE.",
      facts: [
        { text: "Ankle is swollen and they say the pain is 7 out of 10", item: 0 },
        { text: "Allergic to penicillin", item: 1 },
        { text: "Uses a Ventolin puffer for asthma", item: 2 },
        { text: "Broke the same ankle two years ago", item: 3 },
        { text: "Had a banana and some water an hour ago", item: 4 },
        { text: "Landed awkwardly on a sandbar when a wave dumped them", item: 5 },
        { text: "Looks pale and is limping", item: 0 },
        { text: "Took two paracetamol this morning", item: 2 },
      ],
    },
  },
  {
    slug: "imist-ambo",
    name: "IMIST AMBO",
    title: "Handover to paramedics",
    group: "handover",
    when: "A clear, structured handover when paramedics arrive. Use your incident report to help.",
    items: [
      { letter: "I", term: "Identification", detail: "Who the patient is: name, age and gender." },
      { letter: "M", term: "Mechanism of injury / Medical complaint", detail: "What happened, how and when." },
      { letter: "I", term: "Illness and injury", detail: "What you found in your primary and secondary assessments." },
      { letter: "S", term: "Signs", detail: "Vital signs: pulse, breathing rate, skin colour, temperature and conscious state." },
      { letter: "T", term: "Treatment and trends", detail: "First aid you've given and how they've responded over time." },
      { letter: "A", term: "Allergies", detail: "Any known allergies." },
      { letter: "M", term: "Medications", detail: "Medicines they take." },
      { letter: "B", term: "Background", detail: "Relevant medical history." },
      { letter: "O", term: "Other", detail: "Anything else useful, e.g. family contacted, belongings, scene details." },
    ],
    note:
      "The manual sets out IMIST, then says to allow time for the paramedics' questions. AMBO is how paramedics finish the handover; your SAMPLE answers cover most of it.",
    source: "Module 6 – Resuscitation (p. 293)",
    sort: {
      intro: "You're handing over a swimmer pulled from a rip. Sort each line of your handover into IMIST AMBO.",
      facts: [
        { text: "This is Jake, a 24-year-old male", item: 0 },
        { text: "Caught in the rip at the southern end about 20 minutes ago and pulled out by the IRB", item: 1 },
        { text: "He swallowed a lot of water and has a cut on his left knee", item: 2 },
        { text: "Pulse 110, breathing 24 a minute, pale and cold, alert", item: 3 },
        { text: "We've given oxygen and dressed the knee; his breathing has settled a little", item: 4 },
        { text: "Allergic to bee stings", item: 5 },
        { text: "Takes no regular medication", item: 6 },
        { text: "Has had asthma since childhood", item: 7 },
        { text: "His partner is here and has his phone and wallet", item: 8 },
      ],
    },
  },
  {
    slug: "four-s",
    name: "4 S's",
    title: "Handover after CPR",
    group: "handover",
    when: "Four things paramedics need to know when they take over a patient who needed CPR.",
    items: [
      { letter: "S", term: "Seen (or not seen)", detail: "Did anyone see the arrest happen? That tells them how long the patient was down and possibly why." },
      { letter: "S", term: "Started CPR", detail: "What time CPR started, so they know how long it has been going." },
      { letter: "S", term: "Shockable (or not)", detail: "Did the AED advise a shock on its first rhythm check?" },
      { letter: "S", term: "Shocks delivered", detail: "How many shocks have been given in total." },
    ],
    source: "Module 6 – Resuscitation (p. 292)",
  },
  {
    slug: "fast",
    name: "FAST",
    title: "Recognising a stroke",
    group: "first-aid",
    when: "During your secondary assessment, if you suspect a stroke.",
    items: [
      { letter: "F", term: "Face", detail: "Can they smile without one side of the face drooping?" },
      { letter: "A", term: "Arms", detail: "Can they raise both arms?" },
      { letter: "S", term: "Speech", detail: "Can they speak clearly and understand you?" },
      { letter: "T", term: "Time to act", detail: "If they can't do these, send for help and request an ambulance now." },
    ],
    source: "Module 7 – Emergency Care",
  },
  {
    slug: "ricer",
    name: "RICER",
    title: "Soft tissue injuries",
    group: "first-aid",
    when: "Treating sprains, strains and bruising.",
    items: [
      { letter: "R", term: "Rest", detail: "Reassure them; have them sit or lie still with the injury supported." },
      { letter: "I", term: "Ice", detail: "Cold pack or ice wrapped in a damp cloth, on and off for 5–15 minutes at a time." },
      { letter: "C", term: "Compression", detail: "A compression bandage over the area; check circulation beyond it." },
      { letter: "E", term: "Elevation", detail: "Raise the limb to reduce swelling and pain." },
      { letter: "R", term: "Referral", detail: "Refer them to a medical practitioner." },
    ],
    note: "Use it together with no HARM.",
    source: "Module 7 – Emergency Care",
  },
  {
    slug: "harm",
    name: "No HARM",
    title: "What to avoid after a soft tissue injury",
    group: "first-aid",
    when: "Advice for the first 2–3 days after a sprain or strain.",
    items: [
      { letter: "H", term: "Heat", detail: "No hot showers, saunas, hot water bottles or heat rubs." },
      { letter: "A", term: "Alcohol", detail: "It can increase swelling." },
      { letter: "R", term: "Running", detail: "Don't exercise the injury too soon." },
      { letter: "M", term: "Massage", detail: "It increases swelling and bleeding." },
    ],
    source: "Module 7 – Emergency Care",
  },
  {
    slug: "help",
    name: "HELP",
    title: "Staying warm in the water",
    group: "first-aid",
    when: "If you're cold and can't get out of the water.",
    items: [
      { letter: "H", term: "Heat", detail: "Curl into a ball to slow heat loss." },
      { letter: "E", term: "Escape", detail: "" },
      { letter: "L", term: "Lessening", detail: "" },
      { letter: "P", term: "Posture", detail: "Knees up to the chest, arms wrapped around them." },
    ],
    note: "Heat Escape Lessening Posture: the position itself is the point.",
    source: "Module 7 – Emergency Care",
  },
  {
    slug: "im-safe",
    name: "I'M SAFE",
    title: "Fit for patrol",
    group: "patrol",
    when: "A self-check before patrol or training, and a way to tell your patrol captain about any limits.",
    items: [
      { letter: "I", term: "Injury or illness", detail: "Am I fit to work, or fully recovered?" },
      { letter: "M", term: "Medication", detail: "Am I affected by any medication?" },
      { letter: "S", term: "Stress", detail: "Am I showing signs of severe or critical incident stress?" },
      { letter: "A", term: "Alcohol or drugs", detail: "Am I affected by alcohol or drugs?" },
      { letter: "F", term: "Fatigue", detail: "Am I extremely tired?" },
      { letter: "E", term: "Expertise", detail: "Do I need more training to be competent?" },
    ],
    source: "Module 10 – Patrol Operations (p. 433)",
  },
  {
    slug: "calm",
    name: "CALM",
    title: "Resolving conflict",
    group: "patrol",
    when: "Working through a disagreement with another member or a member of the public.",
    items: [
      { letter: "C", term: "Clarify the issue", detail: "Agree on what the conflict is really about." },
      { letter: "A", term: "Ask questions", detail: "Find out what they see as the issue, rather than assuming." },
      { letter: "L", term: "Listen actively", detail: "Restate and summarise what you hear so you're on the same page." },
      { letter: "M", term: "Move forward", detail: "Agree a resolution together, keeping an open mind." },
    ],
    source: "Module 8 – Communication (p. 401)",
  },
  {
    slug: "think-smart",
    name: "THINK SMART",
    title: "Giving feedback",
    group: "patrol",
    when: "Giving another member feedback that's compassionate and constructive.",
    items: [
      { letter: "T", term: "True", detail: "Is it true?" },
      { letter: "H", term: "Helpful", detail: "Is it helpful?" },
      { letter: "I", term: "Inspiring", detail: "Is it inspiring?" },
      { letter: "N", term: "Necessary", detail: "Is it necessary?" },
      { letter: "K", term: "Kind", detail: "Is it kind?" },
      { letter: "S", term: "Specific", detail: "Point to a specific behaviour." },
      { letter: "M", term: "Measurable", detail: "Describe its noticeable impact on results or people." },
      { letter: "A", term: "Actionable", detail: "Suggest alternatives, or ask how they could do it differently." },
      { letter: "R", term: "Relevant", detail: "Keep suggestions relevant." },
      { letter: "T", term: "Timely", detail: "Give it as soon as you can after the behaviour." },
    ],
    note: "THINK is about whether to say it; SMART is about how.",
    source: "Module 8 – Communication (p. 399)",
  },
  {
    slug: "four-ps",
    name: "4 Ps",
    title: "Reporting an incident by radio",
    group: "handover",
    when: "Passing accurate incident details to your state communication centre.",
    items: [
      { letter: "P", term: "Position", detail: "Exactly where: beach name, cross street or landmark, distance from the flags or shore. Avoid local nicknames." },
      { letter: "P", term: "Problem", detail: "What's wrong, and what you need (IRB, ambulance, first aid kit…)." },
      { letter: "P", term: "People", detail: "How many, and how to recognise them: age, gender, clothing." },
      { letter: "P", term: "Progress", detail: "What's happening now, e.g. CPR started, IRB on its way, ambulance arrived." },
    ],
    source: "Module 3 – Radio Operations (pp. 94–95)",
    sort: {
      intro: "You're calling SurfCom about a rescue. Sort each part of your message into the 4 Ps.",
      facts: [
        { text: "About 30 m south of the flags, 40 m offshore", item: 0 },
        { text: "Two swimmers caught in the rip and tiring. We need the IRB", item: 1 },
        { text: "A teenage girl in a pink rash shirt and a man in his 40s with a white cap", item: 2 },
        { text: "A board rescuer is with them and the IRB is launching now", item: 3 },
        { text: "At the rocks at the northern end, near the ocean pool", item: 0 },
        { text: "Possible spinal injury. We need an ambulance and a spinal kit", item: 1 },
      ],
    },
  },
];

export function getMnemonic(slug: string): Mnemonic | undefined {
  return MNEMONICS.find((m) => m.slug === slug);
}

// "IMIST AMBO" -> ["I","M","I","S","T","A","M","B","O"]
export function mnemonicLetters(m: Mnemonic): string[] {
  return m.items.map((i) => i.letter);
}
