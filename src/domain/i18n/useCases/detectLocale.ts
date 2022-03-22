import { DEFAULT_OPTIONS } from '../../../constants';

export default function detectLocale (): string {
  return navigator.language || DEFAULT_OPTIONS.locale;
}
