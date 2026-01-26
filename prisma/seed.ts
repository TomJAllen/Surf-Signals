import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const signals = [
  {
    name: "Assistance Required",
    description:
      "One arm raised with clenched fist, waved side to side. Indicates a swimmer or surfer needs help.",
    imageUrl: "/signals/assistance-required.svg",
    category: "Emergency",
  },
  {
    name: "Return to Shore",
    description:
      "Both arms raised above head, swept together in a diagonal motion toward shore. Directs swimmers to return to the beach.",
    imageUrl: "/signals/return-to-shore.svg",
    category: "Direction",
  },
  {
    name: "Go Further Out",
    description:
      "Both arms raised above head, swept in circular motion away from shore. Indicates swimmers should move further out.",
    imageUrl: "/signals/go-further-out.svg",
    category: "Direction",
  },
  {
    name: "Move Left",
    description:
      "Left arm extended horizontally, pointing left. Right arm raised and swept toward the left. Directs swimmers to move left.",
    imageUrl: "/signals/move-left.svg",
    category: "Direction",
  },
  {
    name: "Move Right",
    description:
      "Right arm extended horizontally, pointing right. Left arm raised and swept toward the right. Directs swimmers to move right.",
    imageUrl: "/signals/move-right.svg",
    category: "Direction",
  },
  {
    name: "Remain Stationary",
    description:
      "Both arms extended horizontally to sides, palms facing forward. Indicates swimmers should stay in their current position.",
    imageUrl: "/signals/remain-stationary.svg",
    category: "Direction",
  },
  {
    name: "Pick Up Swimmers",
    description:
      "One arm raised with hand open, then closed into fist. Used to signal rescue craft to pick up swimmers.",
    imageUrl: "/signals/pick-up-swimmers.svg",
    category: "Rescue",
  },
  {
    name: "All Clear",
    description:
      "Both arms raised straight above head, crossed at wrists. Indicates the area is safe and clear.",
    imageUrl: "/signals/all-clear.svg",
    category: "Status",
  },
  {
    name: "Message Received/Understood",
    description:
      "Both arms raised above head and brought together so hands touch. Acknowledges that a signal has been received.",
    imageUrl: "/signals/message-received.svg",
    category: "Communication",
  },
  {
    name: "Investigate",
    description:
      "One arm pointing at area of concern. Used to direct attention to a specific area for investigation.",
    imageUrl: "/signals/investigate.svg",
    category: "Direction",
  },
  {
    name: "Stop",
    description:
      "One arm raised straight up with open palm facing forward. Signals to stop current activity.",
    imageUrl: "/signals/stop.svg",
    category: "Direction",
  },
  {
    name: "Increase Speed",
    description:
      "Arm extended with hand making circular motion. Indicates rescue craft should increase speed.",
    imageUrl: "/signals/increase-speed.svg",
    category: "Rescue",
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
