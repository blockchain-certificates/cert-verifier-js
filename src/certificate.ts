import domain from './domain';
import parseJSON from './parser';
import Verifier, { IVerificationStepCallbackFn } from './verifier';
import { DEFAULT_OPTIONS } from './constants';
import currentLocale from './constants/currentLocale';
import { Blockcerts } from './models/Blockcerts';
import { TransactionData } from './models/TransactionData';

interface ExplorerURLs {
  main: string;
  test: string;
}

export interface ExplorerAPI {
  serviceURL: string | ExplorerURLs;
  priority: 0 | 1;
  parsingFunction (): TransactionData
}

export interface CertificateOptions {
  locale?: string;
  explorerAPIs?: ExplorerAPI[];
}

export default class Certificate {
  public certificateImage?: string;
  public certificateJson: Blockcerts;
  public chain: any; // TODO: define chain interface
  public description?: string; // v1
  public expires: string;
  public explorerAPIs: ExplorerAPI[] = [];
  public id: string;
  public isFormatValid: boolean;
  public issuedOn: string;
  public issuer: any; // TODO: define issuer interface
  public locale: string; // enum?
  public metadataJson: any; // TODO: define metadataJson interface. As abstract as can be as keys and values are open.
  public name?: string; // TODO: not formally set in V3
  public options: CertificateOptions;
  public publicKey?: string;
  public rawTransactionLink: string;
  public receipt: any; // TODO: define receipt interface
  public recipientFullName: string;
  public recordLink: string;
  public revocationKey: string;
  public sealImage?: string; // v1
  public signature?: string; // v1
  public signatureImage?: string; // v1
  public subtitle?: string; // v1
  public transactionId: string;
  public transactionLink: string;
  public verificationSteps: any[]; // TODO: define verificationSteps interface.
  public version: string; // enum?

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
    if (!parsedCertificate.isFormatValid) {
      throw new Error(parsedCertificate.error);
    }
    this._setProperties(parsedCertificate);
  }

  /**
   * verify
   *
   * @param stepCallback
   * @returns {Promise<*>}
   */
  async verify (stepCallback?: IVerificationStepCallbackFn) {
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
   * _setOptions
   *
   * @param options
   * @private
   */
  _setOptions (options) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    // Set locale
    this.locale = domain.i18n.ensureIsSupported(this.options.locale === 'auto' ? domain.i18n.detectLocale() : this.options.locale);
    this.explorerAPIs = this.options.explorerAPIs || [];

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
  _setProperties ({ certificateImage, chain, description, expires, id, isFormatValid, issuedOn, issuer, metadataJson, name, publicKey, receipt, recipientFullName, recordLink, revocationKey, sealImage, signature, signatureImage, subtitle, version }) {
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
