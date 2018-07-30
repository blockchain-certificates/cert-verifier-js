import domain from './domain';
import parseJSON from './parser';
import Verifier from './verifier';

export default class Certificate {
  constructor (certificateDefinition) {
    if (typeof certificateDefinition !== 'object') {
      try {
        certificateDefinition = JSON.parse(certificateDefinition);
      } catch (err) {
        throw new Error('This is not a valid certificate');
      }
    }

    // Keep certificate JSON object
    this.certificateJson = JSON.parse(JSON.stringify(certificateDefinition));

    // Parse certificate
    this.parseJson(certificateDefinition);
  }

  /**
   * parseJson
   *
   * @param certificateDefinition
   * @returns {*}
   */
  parseJson (certificateDefinition) {
    const parsedCertificate = parseJSON(certificateDefinition);
    this._setProperties(parsedCertificate);
  }

  /**
   * verify
   *
   * @param stepCallback
   * @returns {Promise<*>}
   */
  async verify (stepCallback = () => {}) {
    const verifier = new Verifier({
      certificateJson: this.certificateJson,
      chain: this.chain,
      expires: this.expires,
      id: this.id,
      issuer: this.issuer,
      receipt: this.receipt,
      revocationKey: this.revocationKey,
      transactionId: this.transactionId,
      version: this.version
    });
    return verifier.verify(stepCallback);
  }

  /**
   * _setProperties
   *
   * @param certificateImage
   * @param chain
   * @param description
   * @param expires
   * @param id
   * @param issuedOn
   * @param issuer
   * @param metadataJson
   * @param name
   * @param publicKey
   * @param receipt
   * @param recipientFullName
   * @param recordLink
   * @param revocationKey
   * @param sealImage
   * @param signature
   * @param signatureImage
   * @param subtitle
   * @param version
   * @private
   */
  _setProperties ({certificateImage, chain, description, expires, id, issuedOn, issuer, metadataJson, name, publicKey, receipt, recipientFullName, recordLink, revocationKey, sealImage, signature, signatureImage, subtitle, version}) {
    this.certificateImage = certificateImage;
    this.chain = chain;
    this.description = description;
    this.expires = expires;
    this.id = id;
    this.issuedOn = issuedOn;
    this.issuer = issuer;
    this.metadataJson = metadataJson;
    this.name = name;
    this.publicKey = publicKey;
    this.receipt = receipt;
    this.recipientFullName = recipientFullName;
    this.recordLink = recordLink;
    this.revocationKey = revocationKey;
    this.sealImage = sealImage;
    this.signature = signature;
    this.signatureImage = signatureImage;
    this.subtitle = subtitle;

    // Get the full verification step-by-step map
    this.verificationSteps = domain.certificates.getVerificationMap(chain);

    this.version = version;

    // Transaction ID, link & raw link
    this._setTransactionDetails();
  }

  /**
   * _setTransactionDetails
   *
   * @private
   */
  _setTransactionDetails () {
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.rawTransactionLink = domain.certificates.getTransactionLink(this.transactionId, this.chain, true);
    this.transactionLink = domain.certificates.getTransactionLink(this.transactionId, this.chain);
  }
}
