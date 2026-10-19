import type { ConnectionOptions } from "tls";

// TLS settings for the pg Pool.
// - `sslmode=disable` in DATABASE_URL turns TLS off (plain local Postgres).
// - DATABASE_CA_CERT (PEM text, or base64 of it) verifies the server against that
//   CA. Use this for Supabase: download the CA from Project Settings → Database →
//   SSL Configuration. This is the secure option.
// - Otherwise the certificate is verified against the system CAs, unless
//   DATABASE_SSL_REJECT_UNAUTHORIZED=false (encrypted but unverified; avoid).
export function decodeCa(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const text = raw.includes("BEGIN CERTIFICATE") ? raw : Buffer.from(raw, "base64").toString("utf8");
  // Env vars often store newlines as "\n"
  return text.replace(/\\n/g, "\n");
}

export function pgSslConfig(connectionString: string | undefined): false | ConnectionOptions {
  if (connectionString && /[?&]sslmode=disable\b/.test(connectionString)) {
    return false;
  }
  const ca = decodeCa(process.env.DATABASE_CA_CERT);
  if (ca) {
    return { ca, rejectUnauthorized: true };
  }
  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
  };
}

// pg lets sslmode/sslrootcert/etc in the URL replace the `ssl` option entirely,
// which would silently discard the settings above. Strip them so ours apply.
const SSL_URL_PARAMS = ["sslmode", "sslrootcert", "sslcert", "sslkey", "sslpassword", "uselibpqcompat"];

export function stripSslParams(connectionString: string): string {
  const q = connectionString.indexOf("?");
  if (q === -1) return connectionString;
  const params = new URLSearchParams(connectionString.slice(q + 1));
  for (const p of SSL_URL_PARAMS) params.delete(p);
  const rest = params.toString();
  return connectionString.slice(0, q) + (rest ? `?${rest}` : "");
}
