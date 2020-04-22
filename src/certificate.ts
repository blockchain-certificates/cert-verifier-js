import domain from './domain';
import parseJSON, { ParsedCertificate } from './parser';
import Verifier from './verifier';
import { DEFAULT_OPTIONS } from './constants';
import currentLocale from './constants/currentLocale';
import { Blockcerts } from './models/Blockcerts';

interface CertificateOptions {
  locale?: string;
}

export default class Certificate {
  public certificateJson: Blockcerts;
  public chain: string; // enum?
  public expires: string;
  public id: string;
  public issuer: any; // TODO: define issuer interface
  public receipt: any; // TODO: define receipt interface
  public revocationKey: string;
  public transactionId: string;
  public version: string; // enum?
  public options: CertificateOptions;
  public locale: string; // enum?
  public isFormatValid: boolean;
  public certificateImage?: string;
  public description?: string; // v1
  public issuedOn: string;
  public metadataJson: any; // TODO: define metadataJson interface. As abstract as can be as keys and values are open.
  public name?: string; // TODO: not formally set in V3
  public publicKey?: string;
  public recipientFullName: string;
  public recordLink: string;
  public sealImage?: string; // v1
  public signature?: string; // v1
  public signatureImage?: string; // v1
  public subtitle?: string; // v1
  public verificationSteps: any[]; // TODO: define verificationSteps interface.
  public rawTransactionLink: string;
  public transactionLink: string;

  constructor (certificateDefinition: Blockcerts | string, options: CertificateOptions = {}) {
    // Options
    this._setOptions(options);

    if (typeof certificateDefinition !== 'object') {
      try {
        certificateDefinition = JSON.parse(certificateDefinition);
      } catch (err) {
        throw new Error(domain.i18n.getText('errors', 'certificateNotValid'));
      }
    }

    // Keep certificate JSON object
    this.certificateJson = JSON.parse(JSON.stringify(certificateDefinition));
  }

  async init () {
    // Parse certificate
    await this.parseJson(this.certificateJson);
  }

  /**
   * parseJson
   *
   * @param certificateDefinition
   * @returns {*}
   */
  async parseJson (certificateDefinition) {
    const parsedCertificate = await parseJSON(certificateDefinition);
    if (!(parsedCertificate.isFormatValid as boolean)) {
      throw new Error(parsedCertificate.error);
    }
    this._setProperties(parsedCertificate as ParsedCertificate);
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
    return await verifier.verify(stepCallback);
  }

  /**
   * _setOptions
   *
   * @param options
   * @private
   */
  _setOptions (options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    // Set locale
    this.locale = domain.i18n.ensureIsSupported(this.options.locale === 'auto' ? domain.i18n.detectLocale() : this.options.locale);

    currentLocale.locale = this.locale;
  }

  /**
   * _setProperties
   *
   * @param certificateImage
   * @param chain
   * @param description
   * @param expires
   * @param id
   * @param isFormatValid
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
  _setProperties ({ certificateImage, chain, description, expires, id, isFormatValid, issuedOn, issuer, metadataJson, name, publicKey, receipt, recipientFullName, recordLink, revocationKey, sealImage, signature, signatureImage, subtitle, version }: ParsedCertificate) {
    this.isFormatValid = isFormatValid;
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
    this.verificationSteps = domain.certificates.getVerificationMap(chain, version);

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
