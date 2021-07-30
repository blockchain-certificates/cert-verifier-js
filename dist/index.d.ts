import TransactionData from './models/TransactionData';
import { BlockcertsV1 } from './models/BlockcertsV1';
import { IVerificationStepCallbackFn } from './verifier';
import { IBlockchainObject } from './constants/blockchains';
import Versions from './constants/certificateVersions'; // TODO: improve definition and export from this file

export { BLOCKCHAINS, STEPS, SUB_STEPS, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from './constants';
export { getSupportedLanguages } from './domain/i18n/useCases';
export { SignatureImage } from './models';

export enum SupportedChains {
  Bitcoin = 'bitcoin',
  Ethmain = 'ethmain',
  Ethropst = 'ethropst',
  Ethrinkeby = 'ethrinkeby',
  Mocknet = 'mocknet',
  Regtest = 'regtest',
  Testnet = 'testnet'
}

export enum TRANSACTION_APIS {
  blockcypher = 'blockcypher',
  blockstream = 'blockstream',
  etherscan = 'etherscan',
}

export type TExplorerParsingFunction = ((jsonResponse, chain?: SupportedChains) => TransactionData) | ((jsonResponse, chain?: SupportedChains) => Promise<TransactionData>);

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
  keyPropertyName?: string; // the name of the key property according to the explorer service
}

export interface CertificateOptions {
  locale?: string;
  explorerAPIs?: ExplorerAPI[];
}

declare class Certificate {
  public certificateImage?: string;
  public certificateJson: BlockcertsV1;
  public chain: IBlockchainObject;
  public description?: string; // v1
  public expires: string;
  public explorerAPIs: ExplorerAPI[];
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
  public version: Versions;

  constructor (definition: BlockcertsV1 | string, options?: CertificateOptions);
  async init ();
  async verify (stepCallback?: IVerificationStepCallbackFn);
}

export {
  Certificate
};
