import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "./prisma";

// The 14 signals only change when an admin edits one, so keep the list in
// Next's data cache rather than asking the database on every page load.
const TAG = "signals";

export const getAllSignals = unstable_cache(
  () => prisma.signal.findMany({ orderBy: { name: "asc" } }),
  ["signals-all"],
  { tags: [TAG], revalidate: 3600 }
);

// Call after any change to a signal
export function signalsChanged() {
  try {
    revalidateTag(TAG);
  } catch {
    /* outside a request (tests) */
  }
}
