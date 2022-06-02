import type { ExplorerAPI } from '@blockcerts/explorer-lookup';
import { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import domain from './domain';
import type { ParsedCertificate } from './parsers';
import parseJSON from './parsers/index';
import type { IFinalVerificationStatus, IVerificationStepCallbackFn } from './verifier';
import Verifier from './verifier';
import { DEFAULT_OPTIONS } from './constants';
import currentLocale from './constants/currentLocale';
import type { Blockcerts } from './models/Blockcerts';
import type { IBlockchainObject } from './constants/blockchains';
import { deepCopy } from './helpers/object';
import type { Issuer } from './models/Issuer';
import type { Receipt } from './models/Receipt';
import type { SignatureImage } from './models';
import type { ITransactionLink } from './domain/certificates/useCases/getTransactionLink';
import type { BlockcertsV3Display } from './models/BlockcertsV3';
import convertHashlink from './parsers/helpers/convertHashlink';
import type { IVerificationMapItem } from './models/VerificationMap';

export interface ExplorerURLs {
  main: string;
  test: string;
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

export interface Signers {
  signingDate: string;
  signatureSuiteType: string;
  issuerPublicKey: string;
  issuerName?: string;
  issuerProfileDomain?: string;
  issuerProfileUrl?: string;
  chain?: IBlockchainObject;
  transactionId?: string;
  transactionLink?: string;
}

export default class Certificate {
  public certificateImage?: string;
  public certificateJson: Blockcerts;
  public chain: IBlockchainObject;
  public description?: string; // v1
  public display?: BlockcertsV3Display;
  public expires: string;
  public explorerAPIs: ExplorerAPI[] = [];
  public id: string;
  public isFormatValid: boolean;
  public issuedOn: string;
  public issuer: Issuer;
  public locale: string; // enum?
  public metadataJson: any; // TODO: define metadataJson interface.
  public name?: string; // TODO: not formally set in V3
  public options: CertificateOptions;
  public publicKey?: string;
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
  public hashlinkVerifier: HashlinkVerifier;
  public verificationSteps: IVerificationMapItem[];
  public verifier: Verifier;
  public signers: Signers[] = [];

  constructor (certificateDefinition: Blockcerts | string, options: CertificateOptions = {}) {
    // Options
    this._setOptions(options);

    if (typeof certificateDefinition !== 'object') {
      try {
        certificateDefinition = JSON.parse(certificateDefinition) as Blockcerts;
      } catch (err) {
        throw new Error(domain.i18n.getText('errors', 'certificateNotValid'));
      }
    }

    // Keep certificate JSON object
    this.certificateJson = deepCopy<Blockcerts>(certificateDefinition);
    this.hashlinkVerifier = new HashlinkVerifier();
  }

  async init (): Promise<void> {
    // Parse certificate
    await this.parseJson(this.certificateJson);
    this.verifier = new Verifier({
      certificateJson: this.certificateJson,
      expires: this.expires,
      id: this.id,
      issuer: this.issuer,
      hashlinkVerifier: this.hashlinkVerifier,
      revocationKey: this.revocationKey,
      explorerAPIs: deepCopy<ExplorerAPI[]>(this.explorerAPIs)
    });
    this.setTransactionDetails();
    this.verificationSteps = this.verifier.getVerificationSteps();
  }

  async verify (stepCallback?: IVerificationStepCallbackFn): Promise<IFinalVerificationStatus> {
    const verificationStatus = await this.verifier.verify(stepCallback);

    this.publicKey = this.verifier.getIssuerPublicKey();
    this.setSigners();

    return verificationStatus;
  }

  private async parseJson (certificateDefinition: Blockcerts): Promise<void> {
    const parsedCertificate: ParsedCertificate = await parseJSON(certificateDefinition);
    if (!parsedCertificate.isFormatValid) {
      throw new Error(parsedCertificate.error);
    }
    await this._setProperties(parsedCertificate);
  }

  private setSigners (): void {
    let signingDate: string;
    let signatureSuiteType: string;
    if ('proof' in this.certificateJson) {
      signingDate = this.certificateJson.proof.created;
      signatureSuiteType = this.certificateJson.proof.type;
    } else {
      signingDate = this.certificateJson.issuedOn;
      signatureSuiteType = this.certificateJson.signature.type[0];
    }

    (this.signers as any).push({
      signingDate,
      signatureSuiteType,
      issuerPublicKey: this.verifier.getIssuerPublicKey()
    });
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

  private async _setProperties ({
    certificateImage,
    description,
    display,
    expires,
    id,
    isFormatValid,
    issuedOn,
    issuer,
    metadataJson,
    name,
    publicKey,
    recipientFullName,
    recordLink,
    revocationKey,
    sealImage,
    signature,
    signatureImage,
    subtitle
  }: ParsedCertificate): Promise<void> {
    this.isFormatValid = isFormatValid;
    this.certificateImage = certificateImage;
    this.description = description;
    this.expires = expires;
    this.id = id;
    this.issuedOn = issuedOn;
    this.issuer = issuer;
    this.metadataJson = metadataJson;
    this.name = name;
    this.publicKey = publicKey;
    this.recipientFullName = recipientFullName;
    this.recordLink = recordLink;
    this.revocationKey = revocationKey;
    this.sealImage = sealImage;
    this.signature = signature;
    this.signatureImage = signatureImage;
    this.subtitle = subtitle;
    this.display = await this.parseHashlinksInDisplay(display);
  }

  async parseHashlinksInDisplay (display: BlockcertsV3Display): Promise<BlockcertsV3Display> {
    const modifiedDisplay = deepCopy<BlockcertsV3Display>(display);
    if (!modifiedDisplay) {
      return;
    }

    if (modifiedDisplay.contentMediaType !== 'text/html') { // TODO: enum supported content media types
      return modifiedDisplay;
    }
    modifiedDisplay.content = await convertHashlink(modifiedDisplay.content, this.hashlinkVerifier);
    return modifiedDisplay;
  }

  private setTransactionDetails (): void {
    this.chain = this.verifier.getChain();
    this.receipt = this.verifier.getReceipt();
    this.transactionId = domain.certificates.getTransactionId(this.receipt);
    const transactionLinks: ITransactionLink = domain.certificates.getTransactionLink(this.transactionId, this.chain);
    this.rawTransactionLink = transactionLinks.rawTransactionLink;
    this.transactionLink = transactionLinks.transactionLink;
  }
}
