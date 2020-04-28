import { TRANSACTION_ID_PLACEHOLDER } from './api';

export enum SupportedChains {
  Bitcoin = 'bitcoin',
  Ethmain = 'ethmain',
  Ethropst = 'ethropst',
  Ethrinkeby = 'ethrinkeby',
  Mocknet = 'mocknet',
  Regtest = 'regtest',
  Testnet = 'testnet'
}

export interface IBlockchainObject {
  code: SupportedChains;
  name: string;
  prefixes?: string[];
  test?: boolean;
  signatureValue: string;
  transactionTemplates: {
    full: string;
    raw: string;
  };
}

const BLOCKCHAINS: {[chain in SupportedChains]: IBlockchainObject} = {
  [SupportedChains.Bitcoin]: {
    code: SupportedChains.Bitcoin,
    name: 'Bitcoin',
    prefixes: ['6a20', 'OP_RETURN '],
    signatureValue: 'bitcoinMainnet',
    transactionTemplates: {
      full: `https://blockchain.info/tx/${TRANSACTION_ID_PLACEHOLDER}`,
      raw: `https://blockchain.info/rawtx/${TRANSACTION_ID_PLACEHOLDER}`
    }
  },
  [SupportedChains.Ethmain]: {
    code: SupportedChains.Ethmain,
    name: 'Ethereum',
    prefixes: ['0x'],
    signatureValue: 'ethereumMainnet',
    transactionTemplates: {
      full: `https://etherscan.io/tx/${TRANSACTION_ID_PLACEHOLDER}`,
      raw: `https://etherscan.io/tx/${TRANSACTION_ID_PLACEHOLDER}`
    }
  },
  [SupportedChains.Ethropst]: {
    code: SupportedChains.Ethropst,
    name: 'Ethereum Testnet',
    signatureValue: 'ethereumRopsten',
    transactionTemplates: {
      full: `https://ropsten.etherscan.io/tx/${TRANSACTION_ID_PLACEHOLDER}`,
      raw: `https://ropsten.etherscan.io/getRawTx?tx=${TRANSACTION_ID_PLACEHOLDER}`
    }
  },
  [SupportedChains.Ethrinkeby]: {
    code: SupportedChains.Ethrinkeby,
    name: 'Ethereum Testnet',
    signatureValue: 'ethereumRinkeby',
    transactionTemplates: {
      full: `https://rinkeby.etherscan.io/tx/${TRANSACTION_ID_PLACEHOLDER}`,
      raw: `https://rinkeby.etherscan.io/getRawTx?tx=${TRANSACTION_ID_PLACEHOLDER}`
    }
  },
  [SupportedChains.Mocknet]: {
    code: SupportedChains.Mocknet,
    name: 'Mocknet',
    test: true,
    signatureValue: 'mockchain',
    transactionTemplates: {
      full: '',
      raw: ''
    }
  },
  [SupportedChains.Regtest]: {
    code: SupportedChains.Regtest,
    name: 'Mocknet',
    test: true,
    signatureValue: 'bitcoinRegtest',
    transactionTemplates: {
      full: '',
      raw: ''
    }
  },
  [SupportedChains.Testnet]: {
    code: SupportedChains.Testnet,
    name: 'Bitcoin Testnet',
    signatureValue: 'bitcoinTestnet',
    transactionTemplates: {
      full: `https://testnet.blockchain.info/tx/${TRANSACTION_ID_PLACEHOLDER}`,
      raw: `https://testnet.blockchain.info/rawtx/${TRANSACTION_ID_PLACEHOLDER}`
    }
  }
};

// TODO: use test boolean from entry?
function isTestChain (chain: SupportedChains): boolean {
  return chain !== BLOCKCHAINS.bitcoin.code && chain !== BLOCKCHAINS.ethmain.code;
}

export {
  BLOCKCHAINS,
  isTestChain
};
