const TRANSACTION_APIS = {
  Bitpay: 'bitpay',
  Blockcypher: 'blockcypher',
  Blockexplorer: 'blockexplorer',
  Blockstream: 'blockstream',
  Etherscan: 'etherscan'
};

const TRANSACTION_ID_PLACEHOLDER = '{transaction_id}';

const TRANSACTIONS_APIS_URLS = {
  [TRANSACTION_APIS.Bitpay]: {
    mainnet: `https://insight.bitpay.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
    testnet: `https://api.bitcore.io/api/BTC/testnet/tx/${TRANSACTION_ID_PLACEHOLDER}`
  },
  [TRANSACTION_APIS.Blockcypher]: {
    mainnet: `https://api.blockcypher.com/v1/btc/main/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`,
    testnet: `https://api.blockcypher.com/v1/btc/test3/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`
  },
  [TRANSACTION_APIS.Blockexplorer]: {
    mainnet: `https://blockexplorer.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
    testnet: `https://testnet.blockexplorer.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`
  },
  [TRANSACTION_APIS.Blockstream]: {
    mainnet: `https://blockstream.info/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
    testnet: `https://blockstream.info/testnet/api/tx/${TRANSACTION_ID_PLACEHOLDER}`
  },
  // Add &apikey={key} to EtherScan URL's if getting rate limited
  [TRANSACTION_APIS.Etherscan]: {
    main: 'https://api.etherscan.io/api?module=proxy',
    ropsten: 'https://api-ropsten.etherscan.io/api?module=proxy'
  }
};

export {
  TRANSACTION_APIS,
  TRANSACTIONS_APIS_URLS,
  TRANSACTION_ID_PLACEHOLDER
};
