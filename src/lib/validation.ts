/** Client-side checks mirror the API rules so the user gets an instant message. The server stays the authority. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (value: string) => EMAIL.test(value.trim());

export const isValidName = (value: string) => value.trim().length >= 2;

/** At least 8 characters with an uppercase letter, a lowercase letter and a digit. */
export const isStrongPassword = (value: string) =>
  value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
