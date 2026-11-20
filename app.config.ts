import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json. Google Sign-In on iOS needs the reversed iOS client ID as a URL scheme, and that
 * value is only known once the OAuth client exists in Google Cloud, so the plugin is added only when
 * EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is set. Without it the app still builds and the Google button
 * shows an "unavailable" message.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
  // "1234-abc.apps.googleusercontent.com" -> "com.googleusercontent.apps.1234-abc"
  const iosUrlScheme = iosClientId.endsWith('.apps.googleusercontent.com')
    ? `com.googleusercontent.apps.${iosClientId.replace('.apps.googleusercontent.com', '')}`
    : null;

  return {
    ...(config as ExpoConfig),
    plugins: [
      ...(config.plugins ?? []),
      ...(iosUrlScheme
        ? ([['@react-native-google-signin/google-signin', { iosUrlScheme }]] as NonNullable<ExpoConfig['plugins']>)
        : []),
    ],
  };
};
