import 'babel-polyfill';

import TestnetV1Valid from '../fixtures/testnet-valid-1.2';
import MainnetV2Valid from '../fixtures/mainnet-valid-2.0';
import EthereumV2Valid from '../fixtures/ethereum-main-valid-2.0';

import { BLOCKCHAINS, Certificate } from '../../src/index';
import { readFileAsync } from '../application/utils/readFile';

describe('Certificate parsing', () => {
  describe('parse v1', () => {
    it('parses a v1 certificate', () => {
      const cert = new Certificate(TestnetV1Valid);
      expect(cert.name).toBe(TestnetV1Valid.document.certificate.name);
      expect(cert.signature).toBe(
        'H8o5mPXUHgXp/umCRZeqCZmVUsu8hbv0NchB+hnJWGszL7V8zBuuAcLQzeeRjhCv9TO5cOu/m5zAhJnDfbRHHcE='
      );
    });
  });

  describe('parse v2', () => {
    it('parses a v2 certificate', () => {
      const cert = new Certificate(MainnetV2Valid);
      expect(cert.name).toBe(MainnetV2Valid.badge.name);
      expect(cert.chain.code).toBe(BLOCKCHAINS.bitcoin.code);
    });
  });

  describe('parse ethereum', () => {
    it('parses an ethereum v2 certificate', () => {
      const cert = new Certificate(EthereumV2Valid);
      expect(cert.name).toBe(EthereumV2Valid.badge.name);
      expect(cert.chain.code).toBe(BLOCKCHAINS.ethmain.code);
    });
  });
});

/* xdescribe('Certificate.getTransactionId method', () => {
  it('should return the raw transaction ID of a certificate', async () => {
    const data = await readFileAsync('test/fixtures/sample_cert-valid-1.2.0.json');
    let cert = new Certificate(JSON.parse(data));
    expect(cert.transactionId).toBe('00dbc2c28a6d84653687c7ee2521fb73af1a907c8fcce93ac2c413a1298cd69d');
  });
}); */

xdescribe('Certificate.transactionLink property', () => {
  describe('when the certificate transaction is on mainnet', () => {
    it('should return a link to blockchain.info/tx/', async () => {
      const data = await readFileAsync('test/fixtures/sample-cert-mainnet-valid-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.transactionLink).toBe('https://blockchain.info/tx/2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd');
    });
  });

  describe('when the certificate transaction is on testnet', () => {
    it('should return a link to testnet.blockchain.info/tx/', async () => {
      const data = await readFileAsync('test/fixtures/testnet-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.transactionLink).toBe('https://testnet.blockchain.info/tx/027e21458a168006147a52714cbc01fa9e7188d726727acc56c80a0e25b37df7');
    });
  });

  describe('when the certificate transaction is with mocknet', () => {
    it('should return an empty string', async () => {
      const data = await readFileAsync('test/fixtures/mocknet-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.transactionLink).toBe('');
    });
  });

  describe('when the certificate transaction is with regtest', () => {
    it('should return an empty string', async () => {
      const data = await readFileAsync('test/fixtures/regtest-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.transactionLink).toBe('');
    });
  });

  describe('when the certificate transaction is on ethereum main', () => {
    it('should return a link to etherscan.io', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-mainnet-valid-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.transactionLink).toBe('https://etherscan.io/tx/0xa12c498c8fcf59ee2fe785c94c38be4797fb027e6450439a7ef30ad61d7616d3');
    });
  });

  describe('when the certificate transaction is on ethereum ropsten', () => {
    it('should return a link to ropsten.etherscan.io/tx/', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-valid-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.transactionLink).toBe('https://ropsten.etherscan.io/tx/0x7067ef44065cab2ddb8ef86583a9ff5e41708c6494a3b0591228f8508f33e751');
    });
  });
});

xdescribe('Certificate.rawTransactionLink property', () => {
  describe('when the certificate transaction is on testnet', () => {
    it('should return a link to blockchain.info/rawtx/', async () => {
      const data = await readFileAsync('test/fixtures/sample-cert-mainnet-valid-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.rawTransactionLink).toBe('https://blockchain.info/rawtx/2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd');
    });
  });

  describe('when the certificate transaction is on testnet', () => {
    it('should return a link to testnet.blockchain.info/rawtx/', async () => {
      const data = await readFileAsync('test/fixtures/testnet-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.rawTransactionLink).toBe('https://testnet.blockchain.info/rawtx/027e21458a168006147a52714cbc01fa9e7188d726727acc56c80a0e25b37df7');
    });
  });

  describe('when the certificate transaction is with mocknet', () => {
    it('should return an empty string', async () => {
      const data = await readFileAsync('test/fixtures/mocknet-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.rawTransactionLink).toBe('');
    });
  });

  describe('when the certificate transaction is with regtest', () => {
    it('should return an empty string', async () => {
      const data = await readFileAsync('test/fixtures/regtest-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.rawTransactionLink).toBe('');
    });
  });

  describe('when the certificate transaction is on ethereum main', () => {
    it('should return a link to etherscan.io', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-mainnet-valid-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.rawTransactionLink).toBe('https://etherscan.io/tx/0xa12c498c8fcf59ee2fe785c94c38be4797fb027e6450439a7ef30ad61d7616d3');
    });
  });

  describe('when the certificate transaction is on ethereum ropsten', () => {
    it('should return a link to ropsten.etherscan.io/getRawTx', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-valid-2.0.json');
      let cert = new Certificate(JSON.parse(data));
      expect(cert.rawTransactionLink).toBe('https://ropsten.etherscan.io/getRawTx?tx=0x7067ef44065cab2ddb8ef86583a9ff5e41708c6494a3b0591228f8508f33e751');
    });
  });
});
