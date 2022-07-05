import { DEFAULT_OPTIONS } from '../../../constants/options.js';

export default function detectLocale (): string {
  return navigator.language || DEFAULT_OPTIONS.locale;
}
