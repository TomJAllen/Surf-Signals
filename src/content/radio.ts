// Radio procedure from the SLSA PSAR Training Manual, 35th edition, Module 3 (Radio
// Operations), in our own words. Call signs and some procedures vary by state, so
// the app reminds users to check their state centre SOPs.

export interface Proword {
  word: string;
  meaning: string;
}

export const PROWORDS: Proword[] = [
  { word: "Over", meaning: "I've finished my message and am handing over to you to reply." },
  { word: "Go ahead", meaning: "Go ahead with your message." },
  { word: "Stand by", meaning: "Wait for more information while I do something. Other stations may transmit." },
  { word: "Break", meaning: "Wait for my reply while I break off to call another station." },
  { word: "Roger", meaning: "I understand." },
  { word: "Wilco", meaning: "I understand and will do what you've asked." },
  { word: "Say again", meaning: "Please repeat your message." },
  { word: "Correction", meaning: "I've made an error. The correct information follows." },
  { word: "Affirmative", meaning: "Yes, or permission granted." },
  { word: "Negative", meaning: "No, or permission denied." },
  { word: "Out", meaning: "This conversation is over and the channel is free." },
  { word: "Rescue, Rescue, Rescue", meaning: "Clears the channel for a life-threatening incident or one beyond the patrol's capability." },
];

export const PHONETIC: { letter: string; word: string; say: string }[] = [
  { letter: "A", word: "Alpha", say: "AL fa" },
  { letter: "B", word: "Bravo", say: "BRAH voh" },
  { letter: "C", word: "Charlie", say: "CHAR lee" },
  { letter: "D", word: "Delta", say: "DEL tah" },
  { letter: "E", word: "Echo", say: "ECK oh" },
  { letter: "F", word: "Foxtrot", say: "FOKS trot" },
  { letter: "G", word: "Golf", say: "golf" },
  { letter: "H", word: "Hotel", say: "hoh TELL" },
  { letter: "I", word: "India", say: "IN dee ah" },
  { letter: "J", word: "Juliet", say: "JEW lee ett" },
  { letter: "K", word: "Kilo", say: "KEY loh" },
  { letter: "L", word: "Lima", say: "LEE mah" },
  { letter: "M", word: "Mike", say: "mike" },
  { letter: "N", word: "November", say: "no VEM bar" },
  { letter: "O", word: "Oscar", say: "OSS cah" },
  { letter: "P", word: "Papa", say: "pah PAH" },
  { letter: "Q", word: "Quebec", say: "key BECK" },
  { letter: "R", word: "Romeo", say: "ROW me oh" },
  { letter: "S", word: "Sierra", say: "see AIR rah" },
  { letter: "T", word: "Tango", say: "TANG go" },
  { letter: "U", word: "Uniform", say: "YOU nee form" },
  { letter: "V", word: "Victor", say: "VIC tah" },
  { letter: "W", word: "Whiskey", say: "WISS key" },
  { letter: "X", word: "X-ray", say: "ECKS ray" },
  { letter: "Y", word: "Yankee", say: "YANG key" },
  { letter: "Z", word: "Zulu", say: "ZOO loo" },
];

// Words to spell in the phonetic drill (beaches, equipment, codes)
export const SPELLING_WORDS = [
  "BONDI", "IRB", "AED", "TOWER", "RIP", "SURFCOM", "BRONTE", "COOGEE",
  "MANLY", "OXYGEN", "SSV", "FLAGS", "BUOY", "PATROL", "CRONULLA", "TAMARAMA",
];

export const CALL_SIGNS: { sign: string; usedFor: string; example: string }[] = [
  { sign: "SurfCom", usedFor: "Your state's SLS communication centre (name varies by state).", example: "SurfCom" },
  { sign: "All stations", usedFor: "Everyone on the network.", example: "All stations" },
  { sign: "Patrol", usedFor: "The patrol captain, or the next available patrol member.", example: "Bondi Patrol" },
  { sign: "Roving", usedFor: "A roving patrol.", example: "Bondi Roving" },
  { sign: "Outpost", usedFor: "An outpost patrol.", example: "North Bondi Outpost" },
  { sign: "IRB", usedFor: "Inflatable rescue boat.", example: "Bondi IRB" },
  { sign: "SSV", usedFor: "Side-by-side vehicle.", example: "Bondi SSV" },
];

export const READABILITY: { term: string; meaning: string }[] = [
  { term: "Loud and clear", meaning: "Received and understood." },
  { term: "Unreadable", meaning: "Received, but can't be understood." },
  { term: "Nothing heard", meaning: "No transmission received." },
];

export const RADIO_DONTS = [
  "Declare a patient deceased over the radio",
  "Give out personal information such as phone numbers",
  "Use personal names unless you really have to",
  "Swear",
  "Use the radio for social chat",
];

export const RADIO_TECHNIQUE = [
  "Check the channel is clear before you press the talk (PTT) button",
  "Press PTT, wait a moment, then speak",
  "Hold the radio about 10 cm from your mouth, antenna upright",
  "Speak clearly at a normal volume. Don't shout",
  "Think about what you'll say first: call signs, prowords, then the message",
  "Don't expect an instant reply from an IRB that's in the surf or doing a rescue",
];

// One line of a radio exchange
export interface CallLine {
  from: "you" | "them";
  text: string;
}

export interface CallScenario {
  slug: string;
  title: string;
  situation: string;
  lines: CallLine[];
}

// Built on the structure of the manual's worked examples, with our own details.
// In the "build the call" drill the learner puts the lines in order.
export const CALL_SCENARIOS: CallScenario[] = [
  {
    slug: "radio-check",
    title: "Radio check",
    situation: "You're in the Bondi tower and think your radio might be faulty. Check it with the patrol on the beach.",
    lines: [
      { from: "you", text: "Bondi Patrol, Bondi Patrol, this is Bondi Tower. Over." },
      { from: "them", text: "Bondi Tower, this is Bondi Patrol. Go ahead." },
      { from: "you", text: "Requesting radio check. Over." },
      { from: "them", text: "Your message is loud and clear. How do you read me? Over." },
      { from: "you", text: "Your message is also loud and clear. Out." },
    ],
  },
  {
    slug: "incident",
    title: "Reporting an incident (4 Ps)",
    situation: "A swimmer has a bad fin cut. Report it to SurfCom using the 4 Ps and ask for an ambulance.",
    lines: [
      { from: "you", text: "SurfCom, SurfCom, this is Bondi Patrol. Over." },
      { from: "them", text: "Bondi Patrol, this is SurfCom. Go ahead." },
      { from: "you", text: "Position: Bondi Beach, in front of the surf club, 20 m north of the flags." },
      { from: "you", text: "Problem: deep cut to the left calf from a surfboard fin. We require an ambulance." },
      { from: "you", text: "People: one male, about 30, wearing black boardshorts." },
      { from: "you", text: "Progress: bleeding is controlled and he's being moved to the first aid room. Over." },
      { from: "them", text: "Roger, Bondi Patrol. Tasking an ambulance to your first aid room. SurfCom standing by." },
    ],
  },
  {
    slug: "emergency",
    title: "Emergency call",
    situation: "You need urgent help with a life-threatening incident. Clear the channel and get SurfCom's attention.",
    lines: [
      { from: "you", text: "Rescue, Rescue, Rescue." },
      { from: "you", text: "SurfCom, SurfCom, this is Bondi Patrol. Over." },
      { from: "them", text: "All stations stand by. Break. Bondi Patrol, this is SurfCom. Go ahead." },
      { from: "you", text: "CPR in progress at Bondi Beach, in front of the south tower. Over." },
    ],
  },
  {
    slug: "permission",
    title: "Asking to speak to another station",
    situation: "On a network run by SurfCom, you need to talk to your own IRB. Ask permission first.",
    lines: [
      { from: "you", text: "SurfCom, this is Bondi Patrol. Permission to speak to Bondi IRB. Over." },
      { from: "them", text: "Bondi Patrol, this is SurfCom. Affirmative, go ahead." },
      { from: "you", text: "Bondi IRB, Bondi IRB, this is Bondi Patrol. Over." },
      { from: "them", text: "Bondi Patrol, this is Bondi IRB. Go ahead." },
    ],
  },
];

// The radio tests, in the order they're listed (each has its own page: /test/radio/<id>)
export const RADIO_DRILLS = ["prowords", "phonetic", "spell", "calls"] as const;
export type RadioDrill = (typeof RADIO_DRILLS)[number];
