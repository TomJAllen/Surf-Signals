import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Signal categories:
// - beach-to-water: Signals given from the beach to swimmers/craft in the water
// - water-to-beach: Signals given from the water back to the beach

const signals = [
  // BEACH TO WATER SIGNALS
  {
    name: "Attract Attention",
    description:
      "Both arms crossed above the head, waving side to side. Used to attract the attention of swimmers or water users from the beach.",
    imageUrl: "/signals/beach-to-water/attract-attention.png",
    videoUrl: null,
    category: "beach-to-water",
  },
  {
    name: "Pick Up Swimmers",
    description:
      "One arm extended horizontally pointing in the direction of the swimmers, other arm raised above head making a circular motion. Signals rescue craft to pick up swimmers from the water.",
    imageUrl: "/signals/beach-to-water/pickup-swimmers.png",
    videoUrl: null,
    category: "beach-to-water",
  },
  {
    name: "Proceed Further Out to Sea",
    description:
      "Both arms raised straight above the head with palms facing outward, sweeping upward. Directs swimmers or craft to move further out from shore.",
    imageUrl: "/signals/beach-to-water/proceed-further-out.png",
    videoUrl: null,
    category: "beach-to-water",
  },
  {
    name: "Go to the Right or Left",
    description:
      "One arm extended horizontally pointing in the desired direction. Directs swimmers or craft to move to the right or left as indicated.",
    imageUrl: "/signals/beach-to-water/go-right-or-left.png",
    videoUrl: null,
    category: "beach-to-water",
  },
  {
    name: "Remain Stationary",
    description:
      "Both arms extended horizontally to the sides with palms facing forward. Instructs swimmers or craft to stay in their current position.",
    imageUrl: "/signals/beach-to-water/remain-stationary.png",
    videoUrl: null,
    category: "beach-to-water",
  },
  {
    name: "Message Understood, All Clear",
    description:
      "One arm raised straight above the head then brought down to the side. Acknowledges that a signal from the water has been received and understood.",
    imageUrl: "/signals/beach-to-water/message-understood.png",
    videoUrl: null,
    category: "beach-to-water",
  },
  {
    name: "Pick Up or Adjust Buoys",
    description:
      "Both arms extended to the sides with a circular waving motion. Instructs personnel to pick up or adjust the swimming area buoys.",
    imageUrl: "/signals/beach-to-water/pickup-adjust-buoys.png",
    videoUrl: null,
    category: "beach-to-water",
  },
  {
    name: "Return to Shore",
    description:
      "One arm raised above the head with palm facing forward. Directs swimmers or craft to return to shore immediately.",
    imageUrl: "/signals/beach-to-water/return-to-shore.png",
    videoUrl: null,
    category: "beach-to-water",
  },

  // WATER TO BEACH SIGNALS
  {
    name: "Assistance Required",
    description:
      "One arm raised above the head, waved side to side while in the water on a rescue board. Indicates that the lifesaver or swimmer needs help.",
    imageUrl: "/signals/water-to-beach/assistance-required.png",
    videoUrl: null,
    category: "water-to-beach",
  },
  {
    name: "Shore Signal Received and Understood",
    description:
      "One arm raised straight above the head then brought down, performed while in the water. Confirms that a signal from the shore has been received and understood.",
    imageUrl: "/signals/water-to-beach/shore-signal-received.png",
    videoUrl: null,
    category: "water-to-beach",
  },
  {
    name: "Emergency Evacuation Alarm",
    description:
      "Both arms raised straight above the head while in the water. Signals an emergency requiring immediate evacuation of the water.",
    imageUrl: "/signals/water-to-beach/emergency-evacuation.png",
    videoUrl: null,
    category: "water-to-beach",
  },
  {
    name: "Submerged Victim Missing",
    description:
      "Both arms crossed above the head while in the water. Indicates that a person is missing or has been submerged and cannot be located.",
    imageUrl: "/signals/water-to-beach/submerged-victim.png",
    videoUrl: null,
    category: "water-to-beach",
  },
  {
    name: "All Clear / OK",
    description:
      "One arm raised and touching the top of the head in a circular motion while in the water. Signals that everything is OK and the situation is all clear.",
    imageUrl: "/signals/water-to-beach/all-clear-ok.png",
    videoUrl: null,
    category: "water-to-beach",
  },
  {
    name: "Powercraft Wishes to Return to Shore",
    description:
      "From a rescue boat, one arm raised and waved in a circular motion. Signals that the powercraft needs to return to shore.",
    imageUrl: "/signals/water-to-beach/powercraft-return.png",
    videoUrl: null,
    category: "water-to-beach",
  },
];

async function main() {
  console.log("Seeding database...");

  // Delete old signals that are no longer used
  await prisma.signal.deleteMany({
    where: {
      name: {
        notIn: signals.map((s) => s.name),
      },
    },
  });
  console.log("Removed old signals");

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
