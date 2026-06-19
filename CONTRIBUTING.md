# Contributing

Thanks for helping improve Hackea un Virus.

## How to work

1. Create a branch from `main`.
2. Make focused changes.
3. Run `npm run build`.
4. If the change touches UI behavior, verify it in the browser.
5. Open a pull request with a short explanation of what changed and why.

## Good places to edit

- `src/components/` for UI and screens
- `src/hooks/` for input and navigation behavior
- `src/data/` for molecules, proteins, and simulated docking
- `src/styles/` for theme and layout changes

## Before sending a PR

- Do not commit `node_modules/`
- Do not commit `dist/`
- Keep file names and copy readable for students
- Prefer small, testable changes

## Suggested branch names

- `feature/<short-name>`
- `fix/<short-name>`
- `docs/<short-name>`

## If you use an AI assistant

- Ask it to keep changes minimal and readable
- Ask it to explain any non-obvious code paths
- Verify the output with `npm run build`

