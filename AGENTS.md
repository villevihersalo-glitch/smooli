# AGENTS.md — rules for any AI working on Smooli (Ville's site)

These rules apply to every assistant: Claude, Claude Code, ChatGPT and Codex.

## Start of every session
1. Read `PROJECT.md` (status, next step, decisions) and this file before doing anything.
2. Say in 2–3 lines what you understand the current state and next step to be.
3. If anything in `PROJECT.md` looks outdated or contradicts the code, ask before acting.

## End of every session
1. Update `PROJECT.md`:
   - Stage and "Last updated" (date + which AI tool)
   - "Next step": the one next thing
   - Add finished work to "Done" and new decisions to the "Decisions log"
2. Commit with a clear message and push to GitHub.
3. Give me a 3-line summary: what changed, what to test, what's next.

`PROJECT.md` feeds Ville's project dashboard every morning, so keep "Stage" and "Next step" accurate.

## How to work
- **One feature at a time.** Finish, test and commit it before starting the next.
- **Never redesign systems that weren't asked about.** Extend rather than replace.
- **Explain architecture changes before making them** and wait for a yes.
- **Never break published content.** The site must keep reading every page format Capture has
  written (`docs/FORMAT.md`, Capture's `docs/DATA-FORMAT.md`).
- **Respect the decisions log** in `PROJECT.md`. Don't reopen a decision unless asked.
- I am not a programmer: explain what you changed in plain language, and give exact steps to check it.
- Keep the checks passing. If you can't, say so clearly instead of guessing.
- This repo is **public**: never commit API keys, tokens or anything private.

## Project-specific rules
- Pages are drawn the way Capture draws them: layout numbers and rules come from Capture's
  `model/PageLayout.kt`, `model/Magazine.kt` and `ui/Paper.kt`. Change them there first, then here,
  and keep `tests/` matching.
- No build step and no frameworks: plain HTML, CSS and JavaScript modules.
- Everything around the pages follows the family's LED skin (`docs/LED-SKIN.md` in the app repos).
