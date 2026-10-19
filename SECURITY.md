# Security policy

## Reporting a vulnerability

Please **don't** open a public GitHub issue for security problems.

Report them privately using GitHub's **"Report a vulnerability"** button on the
[Security tab](../../security/advisories/new) of this repository. Include what you
found, how to reproduce it, and its impact. You'll get a reply within a week.

Please don't access other people's data, run automated scanners against the live
site, or disrupt the service while investigating.

## How the app is protected (summary)

- Passwords hashed with bcrypt (cost 12); sign-in and sign-up are rate-limited.
- Sessions are re-validated against the database on every request, so role
  changes, account deletion and "sign out everywhere" take effect immediately.
- The admin area needs both `role = "admin"` in the database and an email in the
  `ADMIN_EMAILS` environment variable, checked server-side on every admin API call.
- Strict security headers (CSP, HSTS, frame-ancestors none, nosniff, Permissions-Policy).
- No secrets are kept in the repository; configuration comes from environment variables.
