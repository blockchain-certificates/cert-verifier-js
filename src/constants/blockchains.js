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
    name: 'Ethereum Testnet',
    signatureValue: 'ethereumRopsten',
    transactionTemplates: {
      full: `https://ropsten.etherscan.io/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`,
      raw: `https://ropsten.etherscan.io/getRawTx?tx=${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`
    }
  },
  ethrinkeby: {
    code: 'ethrinkeby',
    name: 'Ethereum Testnet',
    signatureValue: 'ethereumRinkeby',
    transactionTemplates: {
      full: `https://rinkeby.etherscan.io/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`,
      raw: `https://rinkeby.etherscan.io/getRawTx?tx=${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`
    }
  },
  mocknet: {
    code: 'mocknet',
    name: 'Mocknet',
    test: true,
    signatureValue: 'mockchain',
    transactionTemplates: {
      full: '',
      raw: ''
    }
  },
  regtest: {
    code: 'regtest',
    name: 'Mocknet',
    test: true,
    signatureValue: 'bitcoinRegtest',
    transactionTemplates: {
      full: '',
      raw: ''
    }
  },
  testnet: {
    code: 'testnet',
    name: 'Bitcoin Testnet',
    signatureValue: 'bitcoinTestnet',
    transactionTemplates: {
      full: `https://testnet.blockchain.info/tx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`,
      raw: `https://testnet.blockchain.info/rawtx/${TRANSACTION_TEMPLATE_ID_PLACEHOLDER}`
    }
  }
};
