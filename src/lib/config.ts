/**
 * Runtime configuration. Everything comes from EXPO_PUBLIC_* variables (see .env.example),
 * which Expo inlines at build time. None of these values is a secret.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://nutrikafood.com/api/v1').replace(/\/+$/, '');

/** Web client ID of the Google Cloud project. It is the audience of the ID token the API checks. */
export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
/** iOS client ID of the same project. */
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

export const GOOGLE_CONFIGURED = GOOGLE_WEB_CLIENT_ID.length > 0;

/** Public pages Apple requires inside the app (privacy policy, terms). */
export const WEBSITE_URL = 'https://nutrikafood.com';
