import type { NullableNumber, NullableString } from './helpers';
import type { ParsedKeyObjectV2 } from './Issuer';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Key implements ParsedKeyObjectV2 {
  public publicKey: NullableString;
  public created: NullableNumber;
  public revoked: NullableNumber;
  public expires: NullableNumber;

  constructor (publicKey: NullableString, created: NullableNumber, revoked: NullableNumber, expires: NullableNumber) {
    this.publicKey = publicKey;
    this.created = created;
    this.revoked = revoked;
    this.expires = expires;
  }
}
