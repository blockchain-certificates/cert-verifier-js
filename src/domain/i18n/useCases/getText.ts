import currentLocale from '../../../constants/currentLocale';
import i18n from '../../../data/i18n.json';

export default function getText (group: string, item: string): string { // TODO: use enum for parameters
  if (!group || !item) {
    return '';
  }

  if (!i18n[currentLocale.locale]) {
    return '[missing locale data]';
  }

  if (!i18n[currentLocale.locale][group]) {
    return '[missing locale group data]';
  }

  if (!i18n[currentLocale.locale][group][item]) {
    return '[missing locale item data]';
  }

  return i18n[currentLocale.locale][group][item] || '';
}
