import { DEFAULT_OPTIONS } from '../../../constants';

export default function detectLocale () {
  return navigator.language || navigator.userLanguage || navigator.browserLanguage || DEFAULT_OPTIONS.locale;
}
