# Agent Guide

This repository is meant to be edited by humans and coding agents.

## Build and run

- `npm run dev` for local development
- `npm run build` for production validation
- `npm run preview` to inspect the built app
- `npm run lint` to catch style and hook issues
- `npm run deploy:pages` to publish the build to Cloudflare Pages

## Project layout

- `src/App.tsx` owns the screen flow
- `src/components/` contains screen-level UI and visuals
- `src/hooks/` contains reusable input and scrolling logic
- `src/data/` contains molecules, proteins, affinities, and simulation data
- `public/pdb/` contains local PDB assets used by the viewer

## Change rules

- Keep the project open-source friendly and easy to clone
- Do not add generated files to version control
- Do not commit `node_modules/` or `dist/`
- Prefer explicit, localized changes
- Preserve the educational tone of the app
- Keep the app functional offline when possible

## Validation

- After UI changes, run `npm run build`
- If browser behavior changes, verify in `http://localhost:8080`
- If a change touches gamepad input, verify keyboard fallback too

## Documentation

- Update `README.md` when setup or workflow changes
- Update `CONTRIBUTING.md` when the collaboration flow changes

