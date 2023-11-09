import domain from './domain';
import type { ParsedCertificate } from './parsers';
import parseJSON from './parsers/index';
import type { IFinalVerificationStatus, IVerificationStepCallbackFn } from './verifier';
import Verifier from './verifier';
import { DEFAULT_OPTIONS } from './constants';
import currentLocale from './constants/currentLocale';
import { deepCopy } from './helpers/object';
import convertHashlink, { getHashlinksFrom } from './parsers/helpers/convertHashlink';
import type { HashlinkVerifier } from '@blockcerts/hashlink-verifier';
import type { ExplorerAPI, IBlockchainObject } from '@blockcerts/explorer-lookup';
import type { Blockcerts } from './models/Blockcerts';
import type { Issuer } from './models/Issuer';
import type { SignatureImage } from './models';
import type { BlockcertsV3, BlockcertsV3Display } from './models/BlockcertsV3';
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
  chain?: IBlockchainObject;
  issuerName?: string;
  issuerProfileDomain?: string;
  issuerProfileUrl?: string;
  issuerPublicKey: string;
  rawTransactionLink?: string;
  signatureSuiteType: string;
  signingDate: string;
  transactionId?: string;
  transactionLink?: string;
}

export default class Certificate {
  public certificateImage?: string;
  public certificateJson: Blockcerts;
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
  public recipientFullName: string;
  public recordLink: string;
  public revocationKey: string;
  public sealImage?: string; // v1
  public signature?: string; // v1
  public signatureImage?: SignatureImage[]; // v1
  public signers: Signers[] = [];
  public subtitle?: string; // v1
  public hashlinkVerifier: HashlinkVerifier;
  public hasHashlinks: boolean = false;
  public verificationSteps: IVerificationMapItem[];
  public verifier: Verifier;

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
  }

  async init (): Promise<void> {
    // Parse certificate
    if ((this.certificateJson as BlockcertsV3).display?.content) {
      const hashlinks = getHashlinksFrom((this.certificateJson as BlockcertsV3).display.content);
      if (hashlinks.length) {
        await import('@blockcerts/hashlink-verifier').then((hashlinkLib) => {
          this.hashlinkVerifier = new hashlinkLib.HashlinkVerifier();
        });
      }
    }
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
    await this.verifier.init();
    this.verificationSteps = this.verifier.getVerificationSteps();
  }

  async verify (stepCallback?: IVerificationStepCallbackFn): Promise<IFinalVerificationStatus> {
    const verificationStatus = await this.verifier.verify(stepCallback);

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
    this.signers = this.verifier.getSignersData();
  }

  private _setOptions (options: CertificateOptions): void {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);

    // Set locale
    this.locale = domain.i18n.ensureIsSupported(this.options.locale === 'auto' ? domain.i18n.detectLocale() : this.options.locale);
    this.explorerAPIs = this.options.explorerAPIs ?? [];

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
}
