import domain from './domain';
import parseJSON from './parser';
import Verifier from './verifier';

export default class Certificate {
  constructor (certificateJson) {
    if (typeof certificateJson !== 'object') {
      try {
        certificateJson = JSON.parse(certificateJson);
      } catch (err) {
        throw new Error('This is not a valid certificate');
      }
    }

    // Keep certificate JSON object
    this.certificateJson = JSON.parse(JSON.stringify(certificateJson));

    // Parse certificate
    this.parseJson(certificateJson);
  }

  /**
   * parseJson
   *
   * @param certificateJson
   * @returns {*}
   */
  parseJson (certificateJson) {
    const parsedCertificate = parseJSON(certificateJson);
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
   * @param issuer
   * @param publicKey
   * @param receipt
   * @param recipientFullName
   * @param revocationKey
   * @param sealImage
   * @param signature
   * @param signatureImage
   * @param subtitle
   * @param title
   * @param version
   * @private
   */
  _setProperties ({certificateImage, chain, description, expires, id, issuer, name, publicKey, receipt, recipientFullName, revocationKey, sealImage, signature, signatureImage, subtitle, version}) {
    this.certificateImage = certificateImage;
    this.chain = chain;
    this.description = description;
    this.expires = expires;
    this.id = id;
    this.issuer = issuer;
    this.publicKey = publicKey;
    this.receipt = receipt;
    this.recipientFullName = recipientFullName;
    this.revocationKey = revocationKey;
    this.sealImage = sealImage;
    this.signature = signature;
    this.signatureImage = signatureImage;
    this.subtitle = subtitle;
    this.name = name;
    this.version = version;

    // Transaction ID, link & raw link
    this._setTransactionDetails();

    // Get the full verification step-by-step map
    this.verificationSteps = this._getVerificationStepsMap(version, chain);
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

  /**
   * _getVerificationStepsMap
   *
   * @param certificateVersion
   * @param chain
   * @returns {Array}
   * @private
   */
  _getVerificationStepsMap (certificateVersion, chain) {
    const stepsMap = [];

    return stepsMap;
  }
}
