// A static list of the 14 signals for pages that render before (or without)
// the database, such as the landing page. Mirrors prisma/seed.ts.

export interface SignalSummary {
  name: string;
  imageUrl: string;
  category: "beach-to-water" | "water-to-beach";
}

export const SIGNAL_INDEX: SignalSummary[] = [
  { name: "Attract Attention", imageUrl: "/signals/beach-to-water/attract-attention.png", category: "beach-to-water" },
  { name: "Pick Up Swimmers", imageUrl: "/signals/beach-to-water/pickup-swimmers.png", category: "beach-to-water" },
  { name: "Proceed Further Out to Sea", imageUrl: "/signals/beach-to-water/proceed-further-out.png", category: "beach-to-water" },
  { name: "Go to the Right or Left", imageUrl: "/signals/beach-to-water/go-right-or-left.png", category: "beach-to-water" },
  { name: "Remain Stationary", imageUrl: "/signals/beach-to-water/remain-stationary.png", category: "beach-to-water" },
  { name: "Message Understood, All Clear", imageUrl: "/signals/beach-to-water/message-understood.png", category: "beach-to-water" },
  { name: "Pick Up or Adjust Buoys", imageUrl: "/signals/beach-to-water/pickup-adjust-buoys.png", category: "beach-to-water" },
  { name: "Return to Shore", imageUrl: "/signals/beach-to-water/return-to-shore.png", category: "beach-to-water" },
  { name: "Assistance Required", imageUrl: "/signals/water-to-beach/assistance-required.png", category: "water-to-beach" },
  { name: "Shore Signal Received and Understood", imageUrl: "/signals/water-to-beach/shore-signal-received.png", category: "water-to-beach" },
  { name: "Emergency Evacuation Alarm", imageUrl: "/signals/water-to-beach/emergency-evacuation.png", category: "water-to-beach" },
  { name: "Submerged Victim Missing", imageUrl: "/signals/water-to-beach/submerged-victim.png", category: "water-to-beach" },
  { name: "All Clear / OK", imageUrl: "/signals/water-to-beach/all-clear-ok.png", category: "water-to-beach" },
  { name: "Powercraft Wishes to Return to Shore", imageUrl: "/signals/water-to-beach/powercraft-return.png", category: "water-to-beach" },
];
