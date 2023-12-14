import { getText } from '../../i18n/useCases';

export enum CREDENTIAL_STATUS_OPTIONS {
  'REVOKED' = 'revoked',
  'SUSPENDED' = 'suspended'
}

// eslint-disable-next-line no-template-curly-in-string
const CREDENTIAL_STATUS_PLACEHOLDER = '${CREDENTIAL_STATUS}';

export default function generateRevocationReason (reason: string = '', status: CREDENTIAL_STATUS_OPTIONS = CREDENTIAL_STATUS_OPTIONS.REVOKED): string {
  const statusText = getText('revocation', status);
  reason = reason.trim();
  reason = reason.length > 0 ? ` ${getText('revocation', 'preReason')} ${reason}${reason.slice(-1) !== '.' ? '.' : ''}` : '';
  return `${getText('revocation', 'reason')
    .replace(CREDENTIAL_STATUS_PLACEHOLDER, getText('revocation', statusText))}${reason}`;
}
