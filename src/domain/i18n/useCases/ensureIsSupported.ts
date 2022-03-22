import domain from '../../../domain';
import { DEFAULT_OPTIONS } from '../../../constants';

export function setLocaleValidCase (locale: string): string {
  const localeParts = locale.split('-');
  return localeParts.length > 1
    ? `${localeParts[0].toLowerCase()}-${localeParts[1].toUpperCase()}`
    : localeParts[0].toLowerCase();
}

export default function ensureIsSupported (locale: string): string {
  let isSupported;

  const supportedLanguages = domain.i18n.getSupportedLanguages().map(language => language.toLowerCase());

  // Test RFC 3066 language
  isSupported = supportedLanguages.includes(locale.toLowerCase());

  // Test RFC 3066 language-country
  if (!isSupported) {
    const isoLocale = locale.substr(0, 2).toLowerCase();
    const indexIsoLocale = supportedLanguages.map(language => language.split('-')[0]).indexOf(isoLocale);
    isSupported = indexIsoLocale > -1;

    if (isSupported) {
      locale = supportedLanguages[indexIsoLocale];
    }
  }

  if (!isSupported) {
    locale = DEFAULT_OPTIONS.locale;
  }

  // Get default locale otherwise
  return setLocaleValidCase(locale);
}
