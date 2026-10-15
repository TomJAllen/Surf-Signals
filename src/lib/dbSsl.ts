import type { ConnectionOptions } from "tls";

// TLS settings for the pg Pool.
// - `sslmode=disable` in DATABASE_URL turns TLS off (plain local Postgres).
// - Otherwise TLS is on and the server certificate is verified, unless
//   DATABASE_SSL_REJECT_UNAUTHORIZED=false (only for self-signed certs).
export function pgSslConfig(connectionString: string | undefined): false | ConnectionOptions {
  if (connectionString && /[?&]sslmode=disable\b/.test(connectionString)) {
    return false;
  }
  return {
    rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
  };
}
