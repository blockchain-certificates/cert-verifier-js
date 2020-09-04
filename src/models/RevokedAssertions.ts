export interface RevocationList {
  type: string | any[];
  id: string;
  issuer: string;
  revokedAssertions: RevokedAssertion[];
}

export interface RevokedAssertion {
  id: string;
  revocationReason: string;
}
