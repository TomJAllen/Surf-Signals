# Contributing to Patrol Ready

Thanks for wanting to help. Patrol Ready is a free app for surf lifesavers to learn and test
signals, acronyms and radio. It's a one-person project, so ideas and help are very welcome.

## Ideas, new tests and corrections

- **Open an issue** using the *Idea or new test* template, or
- email the address on the app's Privacy page.

Spotted something that doesn't match what your club teaches? Please say where it differs and
which edition of the SLSA *Public Safety and Aquatic Rescue Training Manual* you're using.

## Code

1. Fork the repo and create a branch.
2. Follow `README.md` to run it locally (you'll need your own Postgres database; nothing
   here connects to the live app).
3. Run `npm run lint`, `npx tsc --noEmit` and `npm test` before opening a pull request.
4. Keep pull requests small and focused, and explain the why in the description.

### Content rules

- Write learning content **in your own words**. Don't copy text or images from SLSA
  materials, and don't use SLSA logos or trademarks.
- Questions must have exactly one defensible right answer.

### Privacy and security

- Never commit secrets or `.env` files, or anyone's personal details.
- Analytics must stay anonymous: no names, emails or account IDs in events.
- Report security problems privately (see `SECURITY.md`), not in a public issue.
