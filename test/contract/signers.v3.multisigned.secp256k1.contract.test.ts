import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import fixture from '../fixtures/v3/proof-chain-example-secp256k1.json';
import { Certificate } from '../../src';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../assertions/v3.0-issuer-profile.json';
import v3RevocationList from '../assertions/v3-revocation-list';

describe('Certificate API Contract test suite', function () {
  describe('signers property', function () {
    describe('given there are multiple signatures to the V3 document', function () {
      let instance;

      beforeAll(async function () {
        const requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json'
        }).resolves(JSON.stringify(v3RevocationList));
        sinon.stub(ExplorerLookup, 'lookForTx').resolves({
          remoteHash: '99d1c6fdb496eae6aa2e357833877ebe4187765780e43a4107fb7abd5968de78',
          issuingAddress: '0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60',
          time: '2022-07-15T16:03:48.000Z',
          revokedAddresses: []
        });
        instance = new Certificate(fixture);
        await instance.init();
        await instance.verify();
      });

      afterAll(function () {
        instance = null;
        sinon.restore();
      });

      describe('Secp256k1 signature', function () {
        it('should expose the signingDate', function () {
          expect(instance.signers[0].signingDate).toBe('2022-07-13T20:21:40.114Z');
        });

        it('should expose the signatureSuiteType', function () {
          expect(instance.signers[0].signatureSuiteType).toBe('EcdsaSecp256k1Signature2019');
        });

        it('should expose the issuerPublicKey', function () {
          expect(instance.signers[0].issuerPublicKey).toBe('eLgKnbj7HdbmYSKB9UTnMzrCfumiKQG9HWxDQTucnWpQ');
        });

        it('should expose the issuerName', function () {
          // TODO: test a case where the issuerName would be properly set
          expect(instance.signers[0].issuerName).toBe('');
        });

        it('should expose the issuerProfileDomain', function () {
          expect(instance.signers[0].issuerProfileDomain).toBe('');
        });

        it('should expose the issuerProfileUrl', function () {
          expect(instance.signers[0].issuerProfileUrl).toBe('');
        });
      });

      describe('MerkleProof2019 signature', function () {
        it('should expose the signingDate', function () {
          expect(instance.signers[1].signingDate).toBe('2022-07-15T11:03:28.746594');
        });

        it('should expose the signatureSuiteType', function () {
          expect(instance.signers[1].signatureSuiteType).toBe('MerkleProof2019');
        });

        it('should expose the issuerPublicKey', function () {
          expect(instance.signers[1].issuerPublicKey).toBe('0x40cf9b7db6fcc742ad0a76b8588c7f8de2b54a60');
        });

        it('should expose the issuerName', function () {
          expect(instance.signers[1].issuerName).toBe('Blockcerts Organization');
        });

        it('should expose the issuerProfileDomain', function () {
          expect(instance.signers[1].issuerProfileDomain).toBe('www.blockcerts.org');
        });

        it('should expose the issuerProfileUrl', function () {
          expect(instance.signers[1].issuerProfileUrl).toBe('https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json');
        });

        it('should expose the chain', function () {
          expect(instance.signers[1].chain).toBe(ExplorerLookup.BLOCKCHAINS.ethropst);
        });

        it('should expose the transactionId', function () {
          expect(instance.signers[1].transactionId).toBe('0xb5559c8a2e3ca5a1e67c08d80a18c9f09bfc993e4a591cdf184159a9a0e173b5');
        });

        it('should expose the transactionLink', function () {
          expect(instance.signers[1].transactionLink).toBe('https://ropsten.etherscan.io/tx/0xb5559c8a2e3ca5a1e67c08d80a18c9f09bfc993e4a591cdf184159a9a0e173b5');
        });

        it('should expose the rawTransactionLink', function () {
          expect(instance.signers[1].rawTransactionLink).toBe('https://ropsten.etherscan.io/getRawTx?tx=0xb5559c8a2e3ca5a1e67c08d80a18c9f09bfc993e4a591cdf184159a9a0e173b5');
        });
      });
    });
  });
});
