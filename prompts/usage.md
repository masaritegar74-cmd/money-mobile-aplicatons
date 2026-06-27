# Usage

## Overview
Expo Router + React Native mobile starter for Expo Go preview.

- Frontend: Expo Router routes in `app/`
- UI: React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`, `Image`)
- Preview: `bun run dev` starts an Andromo AI builder preview proxy, runs Expo web preview behind it, and exposes `/_expo/open?runtime=expo` for Expo Go QR/deep-link metadata
- Typecheck: `bun run typecheck`

## Mobile v1 Rules
- Keep the project Expo Go-compatible.
- Do not add EAS build setup, Expo dev client setup, prebuild output, app-store submission, native binary build scripts, or custom native modules.
- Use React Native primitives and Expo-compatible libraries.
- Do not use DOM elements such as `div`, `span`, `button`, `input`, or browser-only APIs in app screens.
- Do not add a user-managed Convex project or ask the user to log in to Convex.

## Routing
- Add screens under `app/`.
- Use `Stack.Screen` for titles and header options.
- Use `Link` from `expo-router` for navigation.
- Keep route files small and move reusable UI into `src/components/`.

## Styling
- Use `StyleSheet.create` or plain React Native style objects.
- Keep typography and colors in `src/theme.ts` when they are shared.
- Ensure layouts work on narrow mobile widths and on the web preview.

## Verification
- Run `bun run typecheck` after code changes.
- Run `bun run dev` to preview on web and through Expo Go.
- Use the platform-facing `$PORT` URL for both the web iframe and `/_expo/open?runtime=expo`; the template only keeps that port stable while forwarding to Expo internally.
- Do not add app-level Expo manifest or bundle URL rewriting. Andromo AI builder handles remote Expo Go manifest URL rewriting at the platform proxy.
