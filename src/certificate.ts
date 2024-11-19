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
import { isVerifiablePresentation } from './models/BlockcertsV3';
import type { IVerificationMapItem } from './models/VerificationMap';
import { VERIFICATION_STATUSES } from './constants/verificationStatuses';

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
  public description?: string; // v1, v3.2
  public display?: BlockcertsV3Display;
  public expires: string;
  public validFrom: string;
  public explorerAPIs: ExplorerAPI[] = [];
  public id: string;
  public isFormatValid: boolean;
  public isVerifiablePresentation: boolean;
  public issuedOn: string;
  public issuer: Issuer;
  public locale: string; // enum?
  public metadataJson: any; // TODO: define metadataJson interface.
  public name?: string;
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
  public verifiableCredentials: Certificate[];
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
    this.isVerifiablePresentation = isVerifiablePresentation(this.certificateJson as any);

    if (this.isVerifiablePresentation) {
      this.verifiableCredentials = (this.certificateJson as any)
        .verifiableCredential?.map((vc: Blockcerts) => new Certificate(vc, options)) ?? [];
    }
  }

  async init (): Promise<void> {
    if (this.isVerifiablePresentation) {
      for (const vc of this.verifiableCredentials) {
        await vc.init();
      }
    }
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
      validFrom: this.validFrom,
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
    let mainDocumentVerificationStatus = await this.verifier.verify(stepCallback);
    this.setSigners();

    if (this.isVerifiablePresentation) {
      let i = 0;
      console.log('VP has', this.verifiableCredentials.length, 'credentials');
      const credentialVerificationStatus = [];
      for (const vc of this.verifiableCredentials) {
        i++;
        console.log('now verifying certificate', i, vc.id);
        const verificationStatus = await vc.verify(stepCallback);
        console.log('verificationStatus', vc.id, verificationStatus);
        credentialVerificationStatus.push({
          id: vc.id,
          verificationStatus
        });

        if (verificationStatus.status !== VERIFICATION_STATUSES.SUCCESS) {
          mainDocumentVerificationStatus = {
            ...mainDocumentVerificationStatus,
            status: VERIFICATION_STATUSES.FAILURE,
            message: `Credential ${vc.name ? vc.name + ' ' : ''}with id ${vc.id} failed verification. Error: ${verificationStatus.message}`,
            errors: [verificationStatus]
          };
          break;
        }
      }
    }

    return mainDocumentVerificationStatus;
  }

  private async parseJson (certificateDefinition: Blockcerts): Promise<void> {
    const parsedCertificate: ParsedCertificate = await parseJSON(certificateDefinition, this.locale);
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
    validFrom,
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
    this.validFrom = validFrom;
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
