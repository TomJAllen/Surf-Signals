// Last check on every analytics event before it leaves the browser, so nothing
// personal reaches PostHog even by accident:
// - nothing at all is sent from pages that show personal details or carry secrets
//   (admin, account, password reset)
// - URL fragments ("#…") are removed, as they can hold one-time tokens
// - text that looks like an email address is removed from clicked elements

export const PRIVATE_PATH_PREFIXES = ["/admin", "/account", "/reset-password", "/forgot-password"];

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const pathOf = (url: unknown): string | null => {
  if (typeof url !== "string" || !url) return null;
  try {
    return new URL(url, "https://x.invalid").pathname;
  } catch {
    return null;
  }
};

const stripHash = (url: unknown) => (typeof url === "string" ? url.split("#")[0] : url);

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;

const URL_PROPS = ["$current_url", "$referrer", "$initial_referrer", "$initial_current_url", "$prev_pageview_pathname"];

interface Event {
  event: string;
  properties?: Record<string, unknown>;
}

export function scrubEvent<T extends Event>(event: T | null, currentPathname?: string): T | null {
  if (!event) return null;
  const props = { ...(event.properties ?? {}) };

  const path = pathOf(props.$current_url) ?? currentPathname ?? null;
  const pathname = typeof props.$pathname === "string" ? props.$pathname : path;
  if ((pathname && isPrivatePath(pathname)) || (currentPathname && isPrivatePath(currentPathname))) return null;

  for (const key of URL_PROPS) {
    if (key in props) props[key] = stripHash(props[key]);
  }
  // Leaving a private page: keep that it happened, not the private URL
  const prev = pathOf(props.$prev_pageview_pathname);
  if (prev && isPrivatePath(prev)) props.$prev_pageview_pathname = "/[private]";

  if (typeof props.$el_text === "string" && EMAIL.test(props.$el_text)) delete props.$el_text;
  if (Array.isArray(props.$elements)) {
    props.$elements = props.$elements.map((el) => {
      if (el && typeof el === "object" && typeof (el as { $el_text?: unknown }).$el_text === "string" && EMAIL.test((el as { $el_text: string }).$el_text)) {
        const { $el_text: _drop, ...rest } = el as Record<string, unknown>;
        void _drop;
        return rest;
      }
      return el;
    });
  }
  if (typeof props.$elements_chain === "string" && EMAIL.test(props.$elements_chain)) {
    props.$elements_chain = props.$elements_chain.replace(/text="[^"]*@[^"]*"/g, 'text=""');
  }

  return { ...event, properties: props } as T;
}
