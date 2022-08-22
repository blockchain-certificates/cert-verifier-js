import { getText } from './index';

export interface ComposedText {
  preReason?: string;
  reason?: string;
  label?: string;
  description?: string;
  linkText?: string;
}

export default function getComposedText (group: string, item: string): ComposedText {
  return getText(group, item) as ComposedText;
}
