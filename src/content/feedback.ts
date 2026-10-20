import { CONTACT_EMAIL } from "./legal";

// Where people can send ideas, report mistakes or help build the app
export const REPO_URL = "https://github.com/TomJAllen/patrol-ready";

export function ideaMailto(): string | null {
  if (!CONTACT_EMAIL) return null;
  const subject = encodeURIComponent("Patrol Ready idea");
  const body = encodeURIComponent(
    "What would you like to see, or what could be better?\n\n\nYour club (optional):\n"
  );
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
