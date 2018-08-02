export const TRANSACTION_TEMPLATE_ID_PLACEHOLDER = '{TRANSACTION_ID}';

export const BLOCKCHAINS = {
  bitcoin: {
    code: 'bitcoin',
    name: 'Bitcoin',
    prefixes: ['6a20', 'OP_RETURN '],
    signatureValue: 'bitcoinMainnet',
    transactionTemplates: {
      full: `https://blockchain.info/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`,
      raw: `https://blockchain.info/rawtx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`
    }
  },
  ethmain: {
    code: 'ethmain',
    name: 'Ethereum',
    prefixes: ['0x'],
    signatureValue: 'ethereumMainnet',
    transactionTemplates: {
      full: `https://etherscan.io/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`,
      raw: `https://etherscan.io/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`
    }
  },
  ethropst: {
    code: 'ethropst',
    name: 'Ethereum',
    signatureValue: 'ethereumRopsten',
    transactionTemplates: {
      full: `https://ropsten.etherscan.io/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`,
      raw: `https://ropsten.etherscan.io/getRawTx?tx=${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`
    }
  },
  mocknet: {
    code: 'mocknet',
    name: 'Mocknet',
    signatureValue: 'mockchain',
    transactionTemplates: {
      full: '',
      raw: ''
    }
  },
  regtest: {
    code: 'regtest',
    name: 'Mocknet',
    signatureValue: 'bitcoinRegtest',
    transactionTemplates: {
      full: '',
      raw: ''
    }
  },
  testnet: {
    code: 'testnet',
    name: 'Mocknet',
    signatureValue: 'bitcoinTestnet',
    transactionTemplates: {
      full: `https://testnet.blockchain.info/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`,
      raw: `https://testnet.blockchain.info/rawtx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`
    }
  }
};
