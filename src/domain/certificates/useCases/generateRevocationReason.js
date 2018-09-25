import { getText } from '../../i18n/useCases';

export default function generateRevocationReason (reason) {
  reason = reason.trim();
  reason = reason.length > 0 ? ` ${getText('revocation', 'preReason')} ${reason}${reason.slice(-1) !== '.' ? '.' : ''}` : '';
  return `${getText('revocation', 'reason')}${reason}`;
}
