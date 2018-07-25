const blockCypherUrl = 'https://api.blockcypher.com/v1/btc/main/txs/';
const blockCypherTestUrl = 'https://api.blockcypher.com/v1/btc/test3/txs/';
const chainSoUrl = 'https://chain.so/api/v2/get_tx/BTC/';
const chainSoTestUrl = 'https://chain.so/api/v2/get_tx/BTCTEST/';

// Add &apikey={key} to EtherScan URL's if getting rate limited
const etherScanMainUrl = 'https://api.etherscan.io/api?module=proxy';
const etherScanRopstenUrl = 'https://api-ropsten.etherscan.io/api?module=proxy';

export default {
  blockCypherUrl,
  blockCypherTestUrl,
  chainSoUrl,
  chainSoTestUrl,
  etherScanMainUrl,
  etherScanRopstenUrl
};
