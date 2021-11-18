import domain from './domain';
import parseJSON, { ParsedCertificate } from './parsers/index';
import Verifier, { IFinalVerificationStatus, IVerificationStepCallbackFn } from './verifier';
import { DEFAULT_OPTIONS, TRANSACTION_APIS } from './constants';
import currentLocale from './constants/currentLocale';
import { Blockcerts } from './models/Blockcerts';
import { IBlockchainObject } from './constants/blockchains';
import Versions from './constants/certificateVersions';
import { deepCopy } from './helpers/object';
import { TExplorerParsingFunction } from '@blockcerts/explorer-lookup';
import { Issuer } from './models/Issuer';
import { Receipt } from './models/Receipt';
import { MerkleProof2019 } from './models/MerkleProof2019';
import { SignatureImage } from './models';

export interface ExplorerURLs {
  main: string;
  test: string;
}

export interface ExplorerAPI {
  serviceURL?: string | ExplorerURLs;
  priority?: 0 | 1 | -1; // 0: custom APIs will run before the default APIs, 1: after, -1: reserved to default APIs
  parsingFunction?: TExplorerParsingFunction;
  serviceName?: TRANSACTION_APIS; // in case one would want to overload the default explorers
  key?: string; // the user's own key to the service
  keyPropertyName?: string; // the name of the property
}

export interface CertificateOptions {
  // language option
  locale?: string;
  // provide your own custom explorer API to either pass an identifier to a default service
  // or use your own blockchain explorer
  explorerAPIs?: ExplorerAPI[];
  // specify your own DID resolver url
  didResolverUrl?: string;
}

export default class Certificate {
  public certificateImage?: string;
  public certificateJson: Blockcerts;
  public chain: IBlockchainObject;
  public description?: string; // v1
  public expires: string;
  public explorerAPIs: ExplorerAPI[] = [];
  public id: string;
  public isFormatValid: boolean;
  public issuedOn: string;
  public issuer: Issuer;
  public locale: string; // enum?
  public metadataJson: any; // TODO: define metadataJson interface. As abstract as can be as keys and values are open.
  public name?: string; // TODO: not formally set in V3
  public options: CertificateOptions;
  public publicKey?: string;
  public proof?: MerkleProof2019;
  public rawTransactionLink: string;
  public receipt: Receipt;
  public recipientFullName: string;
  public recordLink: string;
  public revocationKey: string;
  public sealImage?: string; // v1
  public signature?: string; // v1
  public signatureImage?: SignatureImage[]; // v1
  public subtitle?: string; // v1
  public transactionId: string;
  public transactionLink: string;
  public verificationSteps: any[]; // TODO: define verificationSteps interface.
  public version: Versions;

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
    this.certificateJson = deepCopy<Blockcerts>(certificateDefinition);
  }

  async init (): Promise<void> {
    // Parse certificate
    await this.parseJson(this.certificateJson);
  }

  async verify (stepCallback?: IVerificationStepCallbackFn): Promise<IFinalVerificationStatus> {
    const verifier = new Verifier({
      certificateJson: this.certificateJson,
      chain: this.chain,
      expires: this.expires,
      id: this.id,
      issuer: this.issuer,
      receipt: this.receipt,
      revocationKey: this.revocationKey,
      transactionId: this.transactionId,
      version: this.version,
      explorerAPIs: deepCopy<ExplorerAPI[]>(this.explorerAPIs),
      proof: this.proof
    });
    const verificationStatus = await verifier.verify(stepCallback);
    this.publicKey = verifier.getIssuingAddress();
    return verificationStatus;
  }

  private async parseJson (certificateDefinition: Blockcerts): Promise<void> {
    const parsedCertificate: ParsedCertificate = await parseJSON(certificateDefinition);
    if (!parsedCertificate.isFormatValid) {
      throw new Error(parsedCertificate.error);
    }
    this._setProperties(parsedCertificate);
  }

  private _setOptions (options: CertificateOptions): void {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    // Set locale
    this.locale = domain.i18n.ensureIsSupported(this.options.locale === 'auto' ? domain.i18n.detectLocale() : this.options.locale);
    this.explorerAPIs = this.options.explorerAPIs || [];

    if (options.didResolverUrl) {
      domain.did.didResolver.url = options.didResolverUrl;
    }

    currentLocale.locale = this.locale;
  }

  private _setProperties ({
    certificateImage,
    chain,
    description,
    expires,
    id,
    isFormatValid,
    issuedOn,
    issuer,
    metadataJson,
    name,
    publicKey,
    proof,
    receipt,
    recipientFullName,
    recordLink,
    revocationKey,
    sealImage,
    signature,
    signatureImage,
    subtitle,
    version
  }: ParsedCertificate): void {
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
    this.proof = proof;
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
    // TODO: refactor. The verifier is calling a subset of this method later to determine the verification steps and
    //  associate them to their function - CALL ONCE VERIFICATION STEPS WITH DID
    this.verificationSteps = domain.certificates.getVerificationMap(chain, version, !!this.issuer.didDocument);

    this.version = version;

    // Transaction ID, link & raw link
    this._setTransactionDetails();
  }

  private _setTransactionDetails (): void {
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    this.rawTransactionLink = domain.certificates.getTransactionLink(this.transactionId, this.chain, true);
    this.transactionLink = domain.certificates.getTransactionLink(this.transactionId, this.chain);
  }
}
