# Quickstart: Property Locking

## Automated

```bash
npm run test:run -- src/content src/contexts src/ai src/components/character
npm run typecheck
npm run lint
```

Expected: template generation tests (1,000 draws per lock combination, SC-001/SC-002), reroll-with-locks tests,
stored-locks tests, AI tests with a mocked provider answering other values for locked fields (SC-005), and component
tests for the padlock (`aria-pressed`, keyboard) all pass.

## Manual (npm start)

1. Lock the race, click Generate 10 times: always the same race; the rest changes; the origin paragraph varies.
2. Lock the age at a value above 85 (reroll age on an elf until it is): Generate never gives a human or an orc.
3. Lock the first name, then roll the gender die: the gender only takes values whose list has that name, or an
   info alert says nothing else fits.
4. Reload: the same padlocks are closed, with the same values.
5. "Unlock all", then Generate: everything changes again.
6. Switch to French: padlock labels read "Verrouiller …" / "Déverrouiller …".
7. Keyboard only: Tab to a padlock, Space toggles it, the state is announced as pressed.
8. With an AI provider: lock the first name, Generate: the name is kept.
