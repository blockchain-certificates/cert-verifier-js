import domain from '../../../domain';
import { DEFAULT_OPTIONS } from '../../../constants';

export function setLocaleValidCase (locale) {
  const localeParts = locale.split('-');
  return `${localeParts[0].toLowerCase()}-${localeParts[1].toUpperCase()}`;
}

export default function ensureIsSupported (locale) {
  let isSupported;

  const supportedLanguages = domain.i18n.getSupportedLanguages();

  // Test language tag (xx-XX)
  isSupported = supportedLanguages.map(language => language.toLowerCase()).indexOf(locale.toLowerCase()) > -1;

  // Test on ISO 639-1 format (xx)
  if (!isSupported) {
    const isoLocale = locale.substr(0, 2).toLowerCase();
    const indexIsoLocale = supportedLanguages.map(language => language.substr(0, 2)).indexOf(isoLocale);
    isSupported = indexIsoLocale > -1;
    locale = supportedLanguages[indexIsoLocale];
  }

  // Get default locale otherwise
  return !isSupported ? DEFAULT_OPTIONS.locale : setLocaleValidCase(locale);
}
