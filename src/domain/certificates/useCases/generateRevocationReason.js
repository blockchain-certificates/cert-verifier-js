const REVOCATION_LANGUAGE = {
  PRE_REASON: 'Reason given:',
  REVOCATION: 'This certificate has been revoked by the issuer.'
};

export default function generateRevocationReason (reason) {
  reason = reason.trim();
  // TODO take strings out to constants
  reason = reason.length > 0 ? ` ${REVOCATION_LANGUAGE.PRE_REASON} ${reason}${reason.slice(-1) !== '.' ? '.' : ''}` : '';
  return `${REVOCATION_LANGUAGE.REVOCATION}${reason}`;
}
