import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate } from '../../src';
import BlockcertsV3DataIntegrityProof from '../fixtures/v3/mocknet-vc-v2-data-integrity-proof.json';
import fixtureBlockcertsIssuerProfile from '../fixtures/issuer-blockcerts.json';

describe('Certificate API Contract test suite', function () {
  describe('signers property', function () {
    describe('given there is only one DataIntegrityProof signature to the V3 document', function () {
      let instance;

      beforeAll(async function () {
        const requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureBlockcertsIssuerProfile));
        instance = new Certificate(BlockcertsV3DataIntegrityProof);
        await instance.init();
        await instance.verify();
      });

      afterAll(function () {
        instance = null;
        sinon.restore();
      });

      it('should expose the signingDate', function () {
        expect(instance.signers[0].signingDate).toBe('2024-02-15T15:22:35.361231');
      });

      it('should expose the signatureSuiteType', function () {
        expect(instance.signers[0].signatureSuiteType).toBe('MerkleProof2019');
      });

      it('should expose the issuerPublicKey', function () {
        expect(instance.signers[0].issuerPublicKey).toBe('This mock chain does not support issuing addresses');
      });

      it('should expose the issuerName', function () {
        expect(instance.signers[0].issuerName).toBe('Blockcerts Organization');
      });

      it('should expose the issuerProfileDomain', function () {
        expect(instance.signers[0].issuerProfileDomain).toBe('www.blockcerts.org');
      });

      it('should expose the issuerProfileUrl', function () {
        expect(instance.signers[0].issuerProfileUrl).toBe('https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json');
      });

      it('should expose the chain', function () {
        expect(instance.signers[0].chain).toBe(ExplorerLookup.BLOCKCHAINS.mocknet);
      });
    });
  });
});
