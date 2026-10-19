// General knowledge questions from the SLSA Public Safety and Aquatic Rescue
// Training Manual, 35th edition, in our own words. One is asked in each day's
// practice. Check them against the latest edition (https://sls.com.au/psar35).

export interface PsarQuestion {
  id: string;
  topic: string;
  question: string;
  answer: string;
  wrong: [string, string, string];
  explain: string;
}

export const PSAR_QUESTIONS: PsarQuestion[] = [
  // Resuscitation
  {
    id: "cpr-ratio",
    topic: "Resuscitation",
    question: "What is the ratio of compressions to rescue breaths in CPR?",
    answer: "30 compressions to 2 breaths",
    wrong: ["15 compressions to 2 breaths", "30 compressions to 1 breath", "5 compressions to 1 breath"],
    explain: "Give 2 rescue breaths after every 30 compressions, about 1 second per breath, watching for the chest to rise.",
  },
  {
    id: "cpr-rate",
    topic: "Resuscitation",
    question: "How fast should you give chest compressions?",
    answer: "100–120 a minute",
    wrong: ["60–80 a minute", "80–100 a minute", "140–160 a minute"],
    explain: "Compress at 100–120 a minute and fully release between compressions so blood can flow back into the heart.",
  },
  {
    id: "cpr-depth",
    topic: "Resuscitation",
    question: "How deep should chest compressions be?",
    answer: "One third of the depth of the chest",
    wrong: ["One quarter of the depth of the chest", "Half the depth of the chest", "Just enough to feel resistance"],
    explain: "Press down one third of the chest's depth, on the lower half of the sternum. This is the same for adults, children and infants.",
  },
  {
    id: "cpr-hands",
    topic: "Resuscitation",
    question: "Where do you place your hands for chest compressions?",
    answer: "On the lower half of the sternum",
    wrong: ["On the upper half of the sternum", "Just below the ribcage", "On the left side of the chest"],
    explain: "Compressions go on the lower half of the sternum (breastbone).",
  },
  {
    id: "cpr-swap",
    topic: "Resuscitation",
    question: "With two rescuers doing CPR, how often should you swap roles?",
    answer: "Every 2 minutes, or sooner if tired",
    wrong: ["Every 30 seconds", "Every 5 minutes", "Only when the ambulance arrives"],
    explain: "Swap every 2 minutes (or earlier if fatigued), for example during AED analysis, so compressions stay effective.",
  },
  {
    id: "cpr-infant",
    topic: "Resuscitation",
    question: "What do you usually use to give chest compressions to an infant?",
    answer: "Two fingers",
    wrong: ["The heel of one hand", "Both hands", "One thumb"],
    explain: "Infants: usually two fingers. Children: one or two hands depending on their size.",
  },
  {
    id: "cpr-children-ratio",
    topic: "Resuscitation",
    question: "For bystander CPR on a child, how does the ratio of compressions to breaths compare with an adult's?",
    answer: "It's the same (30:2)",
    wrong: ["Fewer compressions (15:2)", "More breaths (30:5)", "Breaths only, no compressions"],
    explain: "Bystander CPR for infants and children uses the same ratio as for adults.",
  },
  {
    id: "recovery-roll",
    topic: "Resuscitation",
    question: "When should you roll a patient onto their side during CPR?",
    answer: "If they vomit, regurgitate or show signs of recovery",
    wrong: ["Every 2 minutes", "Before giving any rescue breaths", "Only once the AED has shocked"],
    explain: "Roll them into the lateral (recovery) position urgently if they vomit, regurgitate or start to recover.",
  },
  // Rips and patrol
  {
    id: "rip-dark",
    topic: "Rip currents",
    question: "Which of these is a sign of a rip current?",
    answer: "Deeper, darker-coloured water",
    wrong: ["Lots of waves breaking evenly", "Shallow, sandy water near the shore", "Water that looks the same as either side"],
    explain: "Five common signs: deeper, darker water; fewer breaking waves; a rippled surface surrounded by smoother water; debris floating out to sea; and foamy or sandy water beyond the surf.",
  },
  {
    id: "rip-not-sign",
    topic: "Rip currents",
    question: "Which of these is NOT one of the common signs of a rip current?",
    answer: "More breaking waves than either side",
    wrong: ["Debris floating out to sea", "A rippled surface surrounded by smoother water", "Foamy or sandy water beyond the surf zone"],
    explain: "Rips usually have fewer breaking waves. A rip may show only one or two of the five signs.",
  },
  {
    id: "flags-placement",
    topic: "Setting up a patrol",
    question: "Where should the red and yellow flags be placed?",
    answer: "Next to a sandbank, away from rips",
    wrong: ["Right in front of a rip, so it's watched", "As close to the clubhouse as possible", "Wherever the surf is biggest"],
    explain: "Put the flags beside a sandbank. Warning signs and rescue gear (boards, tubes, fins) go next to rip currents, where people are likely to need help.",
  },
  {
    id: "flags-craft",
    topic: "Setting up a patrol",
    question: "What do the black and white quartered flags mark?",
    answer: "An area where surfing and other craft aren't allowed",
    wrong: ["The safest place to swim", "Where the patrol tower is", "A dangerous rip current"],
    explain: "The black and white quartered 'craft flags' often make a buffer zone either side of the red and yellow flags.",
  },
  {
    id: "flags-evac",
    topic: "Closing the water",
    question: "When the water is being closed in an emergency, which flag goes up with the evacuation alarm?",
    answer: "The red and white quartered flag",
    wrong: ["The black and white quartered flag", "A plain red flag", "The yellow flag"],
    explain: "Sound the emergency evacuation alarm, raise the red and white quartered flag, and tell everyone why the water is closing.",
  },
  {
    id: "float",
    topic: "Survival",
    question: "What's the best way to float if you're tired in the water?",
    answer: "On your back, body stretched out, head in line",
    wrong: ["Upright, treading water hard", "Face down with arms by your sides", "Curled up with your head tucked in"],
    explain: "Lie on your back, fully extended, with your head in line and your head, body, legs and feet at the surface.",
  },
  // First aid
  {
    id: "choking-back-blows",
    topic: "Choking",
    question: "For a choking adult, where do you give back blows?",
    answer: "Between the shoulder blades, with the heel of your hand",
    wrong: ["On the lower back, with a fist", "On the side of the chest, with an open hand", "On the back of the neck, gently"],
    explain: "Give up to five sharp back blows between the shoulder blades, checking the airway after each one.",
  },
  {
    id: "choking-sequence",
    topic: "Choking",
    question: "If back blows don't clear a choking adult's airway, what comes next?",
    answer: "Up to five chest thrusts, then repeat",
    wrong: ["Start CPR straight away", "Give water to swallow", "Wait for them to cough it up"],
    explain: "Keep alternating five back blows and five chest thrusts until it clears or they become unresponsive.",
  },
  {
    id: "bluebottle",
    topic: "Marine stings",
    question: "How should you treat a bluebottle sting?",
    answer: "Hot water, as hot as they can comfortably bear, for 20 minutes",
    wrong: ["Pour vinegar on it", "Rub it with sand", "Ice for 5 minutes"],
    explain: "Pick off tentacles with gloved fingers, rinse with seawater, then hot water for 20 minutes. Vinegar isn't used on bluebottles.",
  },
  {
    id: "vinegar",
    topic: "Marine stings",
    question: "Vinegar is kept for treating stings from which creatures?",
    answer: "Box jellyfish and Irukandji, in tropical areas",
    wrong: ["Bluebottles, everywhere", "Stingrays", "Any jellyfish sting"],
    explain: "Vinegar is only for tropical box jellyfish and Irukandji stings. It can make bluebottle stinging cells fire, and it doesn't relieve pain from venom already injected.",
  },
  {
    id: "stinger-season",
    topic: "Marine stings",
    question: "When is the peak stinger season in tropical Australia?",
    answer: "October to May",
    wrong: ["June to August", "December to February only", "All year round equally"],
    explain: "Peak stinger season is October to May.",
  },
  {
    id: "head-injury",
    topic: "Head injuries",
    question: "After a knock to the head, which sign means you should call an ambulance?",
    answer: "Repeated vomiting",
    wrong: ["They want a drink of water", "A small graze on the forehead", "They feel embarrassed"],
    explain: "Red flags include repeated vomiting, getting drowsier, worsening headache or confusion, seizures, neck pain, and weakness or tingling in the arms or legs.",
  },
  {
    id: "sun-eyes",
    topic: "Sun safety",
    question: "Which eye problem can long-term sun exposure cause?",
    answer: "Cataracts and pterygium",
    wrong: ["Short-sightedness", "Colour blindness", "Lazy eye"],
    explain: "UV light is a major cause of eye damage, including cataracts and pterygium, as well as skin damage.",
  },
];
