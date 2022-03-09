/* eslint-disable */
export interface HashlinkModel {
  hashName: string;
  hashValue: Uint8Array;
  meta?: {
    url?: string[];
    'content-type'?: string;
  }
}

export class HashlinkVerifier {
  /**
   * decode method, abstract wrapper over Hashlink class from digital bazaar hashlink package
   *
   * @param {string} hashlink: the hashlink to be decoded. In this instance it expects a url to be specified.
   * @param {function} onHashlinkUrlDecoded: a callback function called when the source url has been discovered to enable
   * early manipulation (ie: update image in DOM).
   */

  async decode (hashlink: string, onHashlinkUrlDecoded?: (url: string) => void): Promise<HashlinkModel> {}

  /**
   * verify method, abstract wrapper over Hashlink class from digital bazaar hashlink package
   *
   * @param {string} hashlink: the hashlink to be decoded. It will lookup in the previously decoded hashlinks table.
   * if not found it will decode the hashlink before verification.
   */
  async verify (hashlink: string): Promise<boolean> {}
  async verifyHashlinkTable (): Promise<boolean> {}
}
