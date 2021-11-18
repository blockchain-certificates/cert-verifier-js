import i18n from '../../../data/i18n.json';

export default function getSupportedLanguages (): string[] {
  return Object.keys(i18n);
}
