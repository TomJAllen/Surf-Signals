import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Signal categories based on SLSA standards:
// - water: Signals given in or from the water
// - land: Signals given from the beach/shore
// - irb: Signals specific to Inflatable Rescue Boats

const signals = [
  // WATER SIGNALS - Signals given in the water or for swimmers
  {
    name: "Assistance Required",
    description:
      "One arm raised with clenched fist, waved side to side. Used by a swimmer or lifesaver to indicate help is needed.",
    imageUrl: "/signals/assistance-required.svg",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder - replace with actual SLSA video
    category: "water",
  },
  {
    name: "All Clear",
    description:
      "Both arms raised straight above head, crossed at wrists. Indicates the rescue is complete or area is safe.",
    imageUrl: "/signals/all-clear.svg",
    videoUrl: null,
    category: "water",
  },
  {
    name: "Pick Up Swimmers",
    description:
      "One arm raised high with hand open, then closed into fist repeatedly. Signals for rescue craft to collect swimmers from the water.",
    imageUrl: "/signals/pick-up-swimmers.svg",
    videoUrl: null,
    category: "water",
  },

  // LAND SIGNALS - Signals given from the beach
  {
    name: "Return to Shore",
    description:
      "Both arms raised above head, swept together in a diagonal motion toward shore. Directs swimmers to return to the beach immediately.",
    imageUrl: "/signals/return-to-shore.svg",
    videoUrl: null,
    category: "land",
  },
  {
    name: "Go Further Out",
    description:
      "Both arms raised above head, swept outward away from body. Indicates swimmers should move further out from shore.",
    imageUrl: "/signals/go-further-out.svg",
    videoUrl: null,
    category: "land",
  },
  {
    name: "Move Left",
    description:
      "Left arm extended horizontally, right arm raised and swept toward the left. Directs swimmers to move to their left (lifesaver's right).",
    imageUrl: "/signals/move-left.svg",
    videoUrl: null,
    category: "land",
  },
  {
    name: "Move Right",
    description:
      "Right arm extended horizontally, left arm raised and swept toward the right. Directs swimmers to move to their right (lifesaver's left).",
    imageUrl: "/signals/move-right.svg",
    videoUrl: null,
    category: "land",
  },
  {
    name: "Remain Stationary",
    description:
      "Both arms extended horizontally to sides, palms facing forward. Indicates swimmers should stay in their current position.",
    imageUrl: "/signals/remain-stationary.svg",
    videoUrl: null,
    category: "land",
  },
  {
    name: "Message Received/Understood",
    description:
      "Both arms raised above head and brought together so hands touch above head. Acknowledges that a signal has been seen and understood.",
    imageUrl: "/signals/message-received.svg",
    videoUrl: null,
    category: "land",
  },
  {
    name: "Investigate",
    description:
      "One arm extended, pointing at area of concern. Used to direct attention to a specific location that needs checking.",
    imageUrl: "/signals/investigate.svg",
    videoUrl: null,
    category: "land",
  },
  {
    name: "Stop",
    description:
      "One arm raised straight up with open palm facing forward. Signals to stop current activity immediately.",
    imageUrl: "/signals/stop.svg",
    videoUrl: null,
    category: "land",
  },

  // IRB SIGNALS - Signals for Inflatable Rescue Boat operations
  {
    name: "Increase Speed",
    description:
      "Arm extended forward with hand making rapid circular motion. Signals IRB driver to increase speed.",
    imageUrl: "/signals/increase-speed.svg",
    videoUrl: null,
    category: "irb",
  },
  {
    name: "Decrease Speed",
    description:
      "Arm extended to side, palm facing down, moving up and down slowly. Signals IRB driver to slow down.",
    imageUrl: "/signals/decrease-speed.svg",
    videoUrl: null,
    category: "irb",
  },
  {
    name: "Turn Left (IRB)",
    description:
      "Left arm extended horizontally, pointing in direction of turn. Signals IRB driver to turn left.",
    imageUrl: "/signals/irb-turn-left.svg",
    videoUrl: null,
    category: "irb",
  },
  {
    name: "Turn Right (IRB)",
    description:
      "Right arm extended horizontally, pointing in direction of turn. Signals IRB driver to turn right.",
    imageUrl: "/signals/irb-turn-right.svg",
    videoUrl: null,
    category: "irb",
  },
  {
    name: "Stop Engine",
    description:
      "Hand drawn across throat in cutting motion. Signals IRB driver to stop the engine immediately.",
    imageUrl: "/signals/stop-engine.svg",
    videoUrl: null,
    category: "irb",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const signal of signals) {
    await prisma.signal.upsert({
      where: { name: signal.name },
      update: signal,
      create: signal,
    });
    console.log(`Created/updated signal: ${signal.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
