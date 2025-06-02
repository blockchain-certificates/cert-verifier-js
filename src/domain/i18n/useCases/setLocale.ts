import currentLocale from '../../../constants/currentLocale';
export default function setLocale (locale: string): void {
  currentLocale.locale = locale;
}
