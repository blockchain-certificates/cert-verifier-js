export default function generateRevocationReason (reason) {
  reason = reason.trim();
  // TODO take strings out to constants
  reason = reason.length > 0 ? ` Reason given: ${reason}${reason.slice(-1) !== '.' ? '.' : ''}` : '';
  return `This certificate has been revoked by the issuer.${reason}`;
}
