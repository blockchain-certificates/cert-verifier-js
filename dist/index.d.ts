import TransactionData from './models/TransactionData';
import { Blockcerts } from './models/Blockcerts';
import { IVerificationStepCallbackFn } from './verifier'; // TODO: improve definition and export from this file

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

export type TExplorerParsingFunction = ((jsonResponse, chain?: SupportedChains) => TransactionData) | ((jsonResponse, chain?: SupportedChains) => Promise<TransactionData>);

export interface ExplorerURLs {
  main: string;
  test: string;
}

export interface ExplorerAPI {
  serviceURL: string | ExplorerURLs;
  priority: 0 | 1 | -1; // 0: custom APIs will run before the default APIs, 1: after, -1: reserved to default APIs
  parsingFunction: TExplorerParsingFunction;
}

export interface CertificateOptions {
  locale?: string;
  explorerAPIs?: ExplorerAPI[];
}

declare class Certificate {
  constructor (definition: Blockcerts | string, options?: CertificateOptions);
  async init ();
  async verify (stepCallback?: IVerificationStepCallbackFn);
}

export {
  Certificate
};
