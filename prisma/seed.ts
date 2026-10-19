import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { pgSslConfig } from "../src/lib/dbSsl";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: pgSslConfig(process.env.DATABASE_URL),
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Signal wording follows the SLSA PSAR Training Manual, 35th edition (in our own words).
// Videos are the official SLS demonstrations linked from that manual.
// Signal categories:
// - beach-to-water: Signals given from the beach to swimmers/craft in the water
// - water-to-beach: Signals given from the water back to the beach

const signals = [
  // BEACH TO WATER SIGNALS
  {
    name: "Attract Attention",
    description:
      "Both arms (or flags or tubes) waved to and fro, crossing above the head. Used from the beach to get the attention of swimmers, lifesavers or craft in the water.",
    imageUrl: "/signals/beach-to-water/attract-attention.png",
    videoUrl: "https://www.youtube-nocookie.com/embed/tvSx9zKdeJg?rel=0",
    category: "beach-to-water",
    poseHint: "Wave both arms to and fro, crossing them above your head",
  },
  {
    name: "Pick Up Swimmers",
    description:
      "One arm circles around the head while the other is held out level, parallel to the water's edge. Once the craft signals it has understood, direct it to the swimmers in trouble.",
    imageUrl: "/signals/beach-to-water/pickup-swimmers.png",
    videoUrl: "https://www.youtube-nocookie.com/embed/WdzNEsa9ibU?rel=0",
    category: "beach-to-water",
    poseHint: "Circle one arm around your head while the other points out level, along the water's edge",
  },
  {
    name: "Proceed Further Out to Sea",
    description:
      "Both arms held straight up above the head. Tells swimmers or craft to move further out to sea.",
    imageUrl: "/signals/beach-to-water/proceed-further-out.png",
    videoUrl: null,
    category: "beach-to-water",
    poseHint: "Hold both arms straight up above your head",
  },
  {
    name: "Go to the Right or Left",
    description:
      "One arm held out at arm's length, level with the ground, pointing the way to go. Tells swimmers or craft to move to the right or left.",
    imageUrl: "/signals/beach-to-water/go-right-or-left.png",
    videoUrl: null,
    category: "beach-to-water",
    poseHint: "Hold one arm straight out to the side, level with the ground, pointing the way to go",
  },
  {
    name: "Remain Stationary",
    description:
      "Both arms held out at arm's length, level with the ground. Tells swimmers or craft to stay where they are.",
    imageUrl: "/signals/beach-to-water/remain-stationary.png",
    videoUrl: null,
    category: "beach-to-water",
    poseHint: "Hold both arms straight out to your sides, level with the ground",
  },
  {
    name: "Message Understood, All Clear",
    description:
      "One arm held still above the head, then cut away quickly to the side. Given from the beach to show a signal has been received and understood.",
    imageUrl: "/signals/beach-to-water/message-understood.png",
    videoUrl: "https://www.youtube-nocookie.com/embed/bdWmU2MsGTw?rel=0",
    category: "beach-to-water",
    poseHint: "Hold one arm straight up above your head, then cut it away quickly to the side",
  },
  {
    name: "Pick Up or Adjust Buoys",
    description:
      "Both arms raised and lowered together, from 45 degrees below level to 45 degrees above. Once the craft signals it has understood, direct it to the buoys.",
    imageUrl: "/signals/beach-to-water/pickup-adjust-buoys.png",
    videoUrl: "https://www.youtube-nocookie.com/embed/D46UH7qKXLw?rel=0",
    category: "beach-to-water",
    poseHint: "Raise and lower both arms together, from 45° below level to 45° above",
  },
  {
    name: "Return to Shore",
    description:
      "One arm held straight up above the head. Tells swimmers or craft to come back to shore.",
    imageUrl: "/signals/beach-to-water/return-to-shore.png",
    videoUrl: null,
    category: "beach-to-water",
    poseHint: "Hold one arm straight up above your head and keep it there",
  },

  // WATER TO BEACH SIGNALS
  {
    name: "Assistance Required",
    description:
      "One arm waved to and fro above the head. Used at any point during a rescue to ask for help, for example when it's unsafe to return to shore or the patient is too heavy to lift. Beachgoers may also raise one arm if they need help.",
    imageUrl: "/signals/water-to-beach/assistance-required.png",
    videoUrl: "https://www.youtube-nocookie.com/embed/VtVQG-uu7S8?rel=0",
    category: "water-to-beach",
    poseHint: "Wave one arm to and fro above your head",
  },
  {
    name: "Shore Signal Received and Understood",
    description:
      "One arm held straight up above the head, then cut away sharply to the side. Given from the water to show a signal from the beach has been received and understood.",
    imageUrl: "/signals/water-to-beach/shore-signal-received.png",
    videoUrl: "https://www.youtube-nocookie.com/embed/kvK4LkrM5os?rel=0",
    category: "water-to-beach",
    poseHint: "Hold one arm straight up above your head, then cut it away sharply to the side",
  },
  {
    name: "Emergency Evacuation Alarm",
    description:
      "Both arms held straight up above the head. Given from the water to raise the alarm that the water needs to be cleared.",
    imageUrl: "/signals/water-to-beach/emergency-evacuation.png",
    videoUrl: null,
    category: "water-to-beach",
    poseHint: "Hold both arms straight up above your head",
  },
  {
    name: "Submerged Victim Missing",
    description:
      "Both arms raised to form a cross above the head. Shows a swimmer is missing and presumed submerged, and can mark their last known location.",
    imageUrl: "/signals/water-to-beach/submerged-victim.png",
    videoUrl: null,
    category: "water-to-beach",
    poseHint: "Cross both arms above your head",
  },
  {
    name: "All Clear / OK",
    description:
      "The fingertips of one hand touch the middle of the head. Shows that no help is needed with the rescue.",
    imageUrl: "/signals/water-to-beach/all-clear-ok.png",
    videoUrl: null,
    category: "water-to-beach",
    poseHint: "Touch the top of your head with the fingertips of one hand",
  },
  {
    name: "Powercraft Wishes to Return to Shore",
    description:
      "One arm raised and lowered between level and 45 degrees above, in a waving motion. On the beach, acknowledge it, clear a path and signal the route in, and be waiting at the water's edge to receive any patient.",
    imageUrl: "/signals/water-to-beach/powercraft-return.png",
    videoUrl: "https://www.youtube-nocookie.com/embed/fx5E0bf61mM?rel=0",
    category: "water-to-beach",
    poseHint: "Raise and lower one arm, from level up to 45° above, in a waving motion",
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
    // imageUrl and poseHint are editable in the admin page, so don't clobber them on re-seed
    const { imageUrl: _imageUrl, poseHint: _poseHint, ...seedOwned } = signal;
    await prisma.signal.upsert({
      where: { name: signal.name },
      update: seedOwned,
      create: signal,
    });
    console.log(`Created/updated signal: ${signal.name}`);
  }

  // Seed admin user. Never fall back to a known password.
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@surflifesaving.com").trim().toLowerCase();
  let adminPassword = process.env.ADMIN_PASSWORD;
  let generated = false;
  if (!adminPassword) {
    adminPassword = randomBytes(12).toString("base64url");
    generated = true;
  }
  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findFirst({
    where: { email: { equals: adminEmail, mode: "insensitive" } },
  });

  if (existingAdmin) {
    // Existing account: just make sure it's an admin. Password is left alone.
    await prisma.user.update({ where: { id: existingAdmin.id }, data: { role: "admin" } });
  } else {
    await prisma.user.create({
      data: { email: adminEmail, name: "Admin", passwordHash: adminHash, role: "admin" },
    });
    if (generated) {
      console.log(`Generated admin password (shown once, save it now): ${adminPassword}`);
    }
  }
  console.log(`Admin user created/updated: ${adminEmail}`);

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
