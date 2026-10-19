// Every signed-in request re-checks the account (role, terms, "sign out
// everywhere"). The database is a long way from the servers, so each check costs
// a round trip; remembering the answer for a few seconds on the same server
// means a page and the API calls it makes straight after share one lookup.
// Changes made through this server (signing out everywhere, accepting terms)
// clear the entry at once; elsewhere they apply within TTL_MS.

export const SESSION_CHECK_TTL_MS = 10_000;
const MAX_ENTRIES = 1000;

export interface AccountSnapshot {
  role: string;
  termsVersion: string | null;
  sessionVersion: number;
  name: string | null;
  email: string;
}

const cache = new Map<string, { at: number; value: AccountSnapshot | null }>();

export async function checkAccount(
  userId: string,
  load: (id: string) => Promise<AccountSnapshot | null>,
  { fresh = false, now = Date.now() }: { fresh?: boolean; now?: number } = {}
): Promise<AccountSnapshot | null> {
  const hit = cache.get(userId);
  if (!fresh && hit && now - hit.at < SESSION_CHECK_TTL_MS) return hit.value;
  const value = await load(userId);
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
  cache.set(userId, { at: now, value });
  return value;
}

export function forgetAccount(userId: string) {
  cache.delete(userId);
}
