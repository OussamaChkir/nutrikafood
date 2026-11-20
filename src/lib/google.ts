/**
 * The only file that knows which Google sign-in library the app uses. Swapping the library later
 * (for example to the Credential Manager based one on Android) means changing this file only.
 */
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { GOOGLE_CONFIGURED, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '@/lib/config';

export type GoogleResult =
  | { status: 'success'; idToken: string }
  | { status: 'cancelled' }
  | { status: 'unavailable' }
  | { status: 'error' };

let configured = false;

function configure() {
  if (configured) return;
  GoogleSignin.configure({
    // The ID token's audience is the web client ID: this is what the API checks.
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || undefined,
  });
  configured = true;
}

export const isGoogleAvailable = () => GOOGLE_CONFIGURED;

export async function signInWithGoogle(): Promise<GoogleResult> {
  if (!GOOGLE_CONFIGURED) return { status: 'unavailable' };
  try {
    configure();
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return { status: 'cancelled' };
    const idToken = response.data.idToken;
    return idToken ? { status: 'success', idToken } : { status: 'error' };
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS) {
        return { status: 'cancelled' };
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return { status: 'unavailable' };
    }
    return { status: 'error' };
  }
}

/** Forget the Google account on this device so the next sign-in shows the account picker. */
export async function signOutOfGoogle(): Promise<void> {
  if (!GOOGLE_CONFIGURED) return;
  try {
    configure();
    await GoogleSignin.signOut();
  } catch {
    // Nothing to sign out of.
  }
}
