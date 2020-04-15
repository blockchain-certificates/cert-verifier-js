const TRANSACTION_APIS = {
  Bitpay: 'bitpay',
  Blockcypher: 'blockcypher',
  Blockexplorer: 'blockexplorer',
  Blockstream: 'blockstream',
  Etherscan: 'etherscan'
};

const TRANSACTION_ID_PLACEHOLDER = '{transaction_id}';

const ETHERSCAN_API_KEY = 'FJ3CZWH8PQBV8W5U6JR8TMKAYDHBKQ3B1D';

const TRANSACTIONS_APIS_URLS = {
  [TRANSACTION_APIS.Etherscan]: {
    main: `https://api.etherscan.io/api?module=proxy&apikey=${ETHERSCAN_API_KEY}&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`,
    test: `https://api-ropsten.etherscan.io/api?module=proxy&apikey=${ETHERSCAN_API_KEY}&action=eth_getTransactionByHash&txhash=${TRANSACTION_ID_PLACEHOLDER}`
  }
};

export {
  TRANSACTION_APIS,
  TRANSACTIONS_APIS_URLS,
  TRANSACTION_ID_PLACEHOLDER
};
