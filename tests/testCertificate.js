'use strict';

import 'babel-polyfill';
import { assert, expect } from 'chai';
import { Blockchain, Certificate } from '../lib/index';
import { readFileAsync } from '../lib/promisifiedRequests';

describe('Certificate parsing', () => {
  describe('parse v2', () => {
    it('parses a v2 certificate', async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-valid-2.0.json');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.name).to.equal('Eularia Landroth');
        expect(cert.chain).to.equal(Blockchain.testnet);
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });

  describe('parse ethereum', () => {
    it('parses an ethereum v2 certificate', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_ethereum_cert-valid-2.0.json',
        );
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.name).to.equal('Eularia Landroth');
        expect(cert.chain).to.equal(Blockchain.ethropst);
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });

  describe('parse v1', () => {
    it('parses a v1 certificate', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-valid-1.2.0.json',
        );
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.name).to.equal('Arya Stark');
        expect(cert.signature).to.equal(
          'H0osFKllW8LrBhNMc4gC0TbRU0OK9Qgpebji1PgmNsgtSKCLXHL217cEG3FoHkaF/G2woGaoKDV/MrmpROvD860=',
        );
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });
});

describe('Certificate.getTransactionId method', () => {
  it('should return the raw transaction ID of a certificate', async () => {
    try {
      const data = await readFileAsync('tests/data/sample_cert-valid-1.2.0.json');
      let cert = Certificate.parseJson(JSON.parse(data));
      expect(cert.transactionId).to.equal('8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d');
    } catch (err) {
      assert.fail('This test should pass');
    }
  });
});

describe('Certificate.getRawTransactionLink method', () => {
  describe('when the certificate transaction is on testnet', () => {
    it('should return a link to testnet.blockchain.info', async () => {
      try {
        const data = await readFileAsync('tests/data/testnet-2.0.json');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.rawTransactionLink).to.equal('https://testnet.blockchain.info/tx/027e21458a168006147a52714cbc01fa9e7188d726727acc56c80a0e25b37df7');
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });

  describe('when the certificate transaction is with mocknet', () => {
    it('should return an empty string', async () => {
      try {
        const data = await readFileAsync('tests/data/mocknet-2.0.json');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.rawTransactionLink).to.equal('');
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });

  describe('when the certificate transaction is with regtest', () => {
    it('should return an empty string', async () => {
      try {
        const data = await readFileAsync('tests/data/regtest-2.0.json');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.rawTransactionLink).to.equal('');
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });

  // TODO: when we will have an certificate example on ethereum main
  xdescribe('when the certificate transaction is on ethereum main', () => {
    it('should return a link to etherscan.io', async () => {
      try {
        const data = await readFileAsync('');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.rawTransactionLink).to.equal('');
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });

  describe('when the certificate transaction is on ethereum ropsten',  () => {
    it('should return a link to ropsten.etherscan.io', async () => {
      try {
        const data = await readFileAsync('tests/data/sample_ethereum_cert-valid-2.0.json');
        let cert = Certificate.parseJson(JSON.parse(data));
        expect(cert.rawTransactionLink).to.equal('https://ropsten.etherscan.io/tx/0x7067ef44065cab2ddb8ef86583a9ff5e41708c6494a3b0591228f8508f33e751');
      } catch (err) {
        assert.fail('This test should pass');
      }
    });
  });
});