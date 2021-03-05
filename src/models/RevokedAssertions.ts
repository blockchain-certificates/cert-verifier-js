export interface RevokedAssertion {
  id: string;
  revocationReason: string;
}

export interface RevocationList {
  type: string | any[];
  id: string;
  issuer: string;
  revokedAssertions: RevokedAssertion[];
}
