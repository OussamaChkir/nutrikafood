import { getLocales } from 'expo-localization';

export type Locale = 'en' | 'fr';

/** Same two languages as the website. Anything else falls back to English. */
export function detectLocale(): Locale {
  const code = getLocales()[0]?.languageCode;
  return code === 'fr' ? 'fr' : 'en';
}

const en = {
  appName: 'Nutrika',
  tagline: 'Know what is really in your food.',
  welcomeBody: 'Scan a barcode and get a clear, honest score for every product, adapted to you.',
  continueWithGoogle: 'Continue with Google',
  continueWithEmail: 'Continue with email',
  or: 'or',
  signIn: 'Sign in',
  signUp: 'Create account',
  signInTitle: 'Welcome back',
  signUpTitle: 'Create your account',
  name: 'Name',
  email: 'Email',
  password: 'Password',
  passwordHint: 'At least 8 characters, with an uppercase letter, a lowercase letter and a digit.',
  forgotPassword: 'Forgot password?',
  noAccount: 'No account yet?',
  haveAccount: 'Already have an account?',
  forgotTitle: 'Reset your password',
  forgotBody: 'Enter your email and we will send you a link to choose a new password.',
  sendLink: 'Send reset link',
  forgotSent: 'If an account exists for this email, a reset link is on its way. Check your inbox.',
  back: 'Back',
  agreePrefix: 'By continuing you accept our',
  terms: 'Terms',
  and: 'and',
  privacy: 'Privacy Policy',
  scanTab: 'Scan',
  profileTab: 'Profile',
  scanTitle: 'Scan',
  scanSoon: 'Barcode scanning arrives in the next update.',
  profileTitle: 'Profile',
  signedInAs: 'Signed in as',
  signOut: 'Sign out',
  deleteAccount: 'Delete account',
  deleteTitle: 'Delete your account',
  deleteBody: 'This permanently deletes your account, profiles and history. It cannot be undone. Type your email to confirm.',
  deleteConfirm: 'Delete permanently',
  cancel: 'Cancel',
  loading: 'Loading…',
  // Errors
  errEmailInvalid: 'Enter a valid email address.',
  errNameShort: 'Enter your name (2 characters or more).',
  errPasswordWeak: 'Password needs 8+ characters with an uppercase letter, a lowercase letter and a digit.',
  errPasswordEmpty: 'Enter your password.',
  errInvalidCredentials: 'Email or password is incorrect.',
  errEmailTaken: 'An account with this email already exists. Try signing in.',
  errRateLimited: 'Too many attempts. Please wait a moment and try again.',
  errRateLimitedIn: 'Too many attempts. Try again in {seconds} s.',
  errNetwork: 'No connection. Check your internet and try again.',
  errUnavailable: 'The service is unavailable right now. Please try again later.',
  errGoogleUnavailable: 'Google sign-in is not available right now.',
  errGoogleFailed: 'Google sign-in failed. Please try again.',
  errEmailUnverified: 'Your Google email is not verified, so we cannot use it.',
  errEmailMismatch: 'That email does not match your account.',
  errAdminBlocked: 'Administrator accounts cannot be deleted from the app.',
  errGeneric: 'Something went wrong. Please try again.',
};

export type MessageKey = keyof typeof en;

const fr: Record<MessageKey, string> = {
  appName: 'Nutrika',
  tagline: 'Sachez ce que contient vraiment votre assiette.',
  welcomeBody: 'Scannez un code-barres et obtenez un score clair et honnête pour chaque produit, adapté à vous.',
  continueWithGoogle: 'Continuer avec Google',
  continueWithEmail: 'Continuer avec un e-mail',
  or: 'ou',
  signIn: 'Se connecter',
  signUp: 'Créer un compte',
  signInTitle: 'Bon retour',
  signUpTitle: 'Créez votre compte',
  name: 'Nom',
  email: 'E-mail',
  password: 'Mot de passe',
  passwordHint: 'Au moins 8 caractères, avec une majuscule, une minuscule et un chiffre.',
  forgotPassword: 'Mot de passe oublié ?',
  noAccount: 'Pas encore de compte ?',
  haveAccount: 'Vous avez déjà un compte ?',
  forgotTitle: 'Réinitialiser le mot de passe',
  forgotBody: 'Saisissez votre e-mail et nous vous enverrons un lien pour choisir un nouveau mot de passe.',
  sendLink: 'Envoyer le lien',
  forgotSent: 'Si un compte existe pour cet e-mail, un lien de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception.',
  back: 'Retour',
  agreePrefix: 'En continuant, vous acceptez nos',
  terms: 'Conditions',
  and: 'et notre',
  privacy: 'Politique de confidentialité',
  scanTab: 'Scanner',
  profileTab: 'Profil',
  scanTitle: 'Scanner',
  scanSoon: 'Le scan de code-barres arrive dans la prochaine mise à jour.',
  profileTitle: 'Profil',
  signedInAs: 'Connecté en tant que',
  signOut: 'Se déconnecter',
  deleteAccount: 'Supprimer le compte',
  deleteTitle: 'Supprimer votre compte',
  deleteBody: 'Cela supprime définitivement votre compte, vos profils et votre historique. Action irréversible. Saisissez votre e-mail pour confirmer.',
  deleteConfirm: 'Supprimer définitivement',
  cancel: 'Annuler',
  loading: 'Chargement…',
  errEmailInvalid: 'Saisissez une adresse e-mail valide.',
  errNameShort: 'Saisissez votre nom (2 caractères ou plus).',
  errPasswordWeak: 'Le mot de passe doit avoir 8 caractères ou plus, avec une majuscule, une minuscule et un chiffre.',
  errPasswordEmpty: 'Saisissez votre mot de passe.',
  errInvalidCredentials: 'E-mail ou mot de passe incorrect.',
  errEmailTaken: 'Un compte existe déjà avec cet e-mail. Essayez de vous connecter.',
  errRateLimited: 'Trop de tentatives. Patientez un instant puis réessayez.',
  errRateLimitedIn: 'Trop de tentatives. Réessayez dans {seconds} s.',
  errNetwork: 'Pas de connexion. Vérifiez votre accès à internet puis réessayez.',
  errUnavailable: 'Le service est indisponible pour le moment. Réessayez plus tard.',
  errGoogleUnavailable: 'La connexion Google n’est pas disponible pour le moment.',
  errGoogleFailed: 'La connexion Google a échoué. Veuillez réessayer.',
  errEmailUnverified: 'Votre e-mail Google n’est pas vérifié, nous ne pouvons pas l’utiliser.',
  errEmailMismatch: 'Cet e-mail ne correspond pas à votre compte.',
  errAdminBlocked: 'Les comptes administrateur ne peuvent pas être supprimés depuis l’application.',
  errGeneric: 'Une erreur est survenue. Veuillez réessayer.',
};

export const messages: Record<Locale, Record<MessageKey, string>> = { en, fr };

export function translate(locale: Locale, key: MessageKey, params?: Record<string, string | number>): string {
  let text = messages[locale][key] ?? messages.en[key];
  if (params) {
    for (const [name, value] of Object.entries(params)) text = text.replace(`{${name}}`, String(value));
  }
  return text;
}
