import { messages, translate } from './i18n';

describe('i18n', () => {
  it('has the same keys in English and French', () => {
    expect(Object.keys(messages.fr).sort()).toEqual(Object.keys(messages.en).sort());
  });

  it('fills parameters', () => {
    expect(translate('en', 'errRateLimitedIn', { seconds: 12 })).toContain('12 s');
    expect(translate('fr', 'errRateLimitedIn', { seconds: 12 })).toContain('12 s');
  });

  it('has no empty strings', () => {
    for (const locale of ['en', 'fr'] as const) {
      for (const value of Object.values(messages[locale])) expect(value.length).toBeGreaterThan(0);
    }
  });
});
