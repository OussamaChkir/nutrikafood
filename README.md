# Nutrika mobile app

React Native + Expo (SDK 58, Expo Router) app for [Nutrika](https://nutrikafood.com). It talks to the website's `/api/v1` (see `docs/api/mobile-v1.openapi.yaml` in the website repo).

## Status

| Milestone | State |
| --- | --- |
| Sign in with email, Google; account deletion; sign out | done (this repo) |
| Sign in with Apple | next (required by App Store guideline 4.8 before submission) |
| Scan, product, profiles, history, favorites, shopping list | next (API is ready) |

## Run it

```bash
npm install
cp .env.example .env.local   # fill in the Google client IDs
npx expo start --dev-client
```

Google Sign-In uses native code, so **Expo Go cannot run this app**. Make a development build:

```bash
npx eas-cli@latest build --profile development --platform ios   # on a device
npx eas-cli@latest build --profile development-simulator --platform ios   # simulator
```

Email sign-in works in any build. Without `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` the Google button shows an "unavailable" message instead of crashing.

## Google sign-in setup

1. Google Cloud Console, same project as the website's Google login, APIs & Services, Credentials.
2. Create an **iOS** OAuth client with bundle ID `com.nutrikafood.app`. Put its ID in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
3. Use the existing **Web** client ID as `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (it is the audience of the ID token).
4. On the server (Vercel), add both IDs to `GOOGLE_CLIENT_IDS` (comma separated) so `POST /auth/google` accepts the tokens.
5. For Android later: create an Android client with package `com.nutrikafood.app` and the SHA-1 of the signing key.

## Checks

```bash
npx tsc --noEmit
npx expo lint
npm test
```

## Layout

- `src/app/(auth)`: Welcome, Sign in, Create account, Forgot password (shown when signed out)
- `src/app/(app)`: tabs shown when signed in. Routes are guarded with `Stack.Protected`
- `src/lib/api`: API client. Refresh tokens rotate and are single use, so there is one refresh in flight at a time
- `src/lib/session`: secure token storage (Keychain/Keystore) and the session provider
- `src/lib/google.ts`: the only file that knows the Google sign-in library
- `src/lib/i18n.ts`: English and French

## App Store rules built into the app

No user generated content, no payments, no label photo scan in the first release (owner decision, see the website repo `docs/app-store-guardrails.md`). Account deletion is in Profile (guideline 5.1.1(v)). Apple sign-in must ship together with Google.

## Before release (TODO)

- Replace the placeholder "G" in `src/components/google-button.tsx` with Google's official logo asset.
- Replace the template app icon, adaptive icon and splash image with the Nutrika brand assets.
- Sign in with Apple, medical disclaimer on health screens, demo account for App Review.
