import { isStrongPassword, isValidEmail, isValidName } from './validation';

describe('validation', () => {
  it('accepts normal emails and rejects malformed ones', () => {
    expect(isValidEmail('a@b.co')).toBe(true);
    expect(isValidEmail(' a@b.co ')).toBe(true);
    expect(isValidEmail('a@b')).toBe(false);
    expect(isValidEmail('a b@c.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('requires a name of two characters or more', () => {
    expect(isValidName('Al')).toBe(true);
    expect(isValidName(' A ')).toBe(false);
  });

  it('matches the API password rule', () => {
    expect(isStrongPassword('Abcdefg1')).toBe(true);
    expect(isStrongPassword('abcdefg1')).toBe(false);
    expect(isStrongPassword('ABCDEFG1')).toBe(false);
    expect(isStrongPassword('Abcdefgh')).toBe(false);
    expect(isStrongPassword('Ab1')).toBe(false);
  });
});
