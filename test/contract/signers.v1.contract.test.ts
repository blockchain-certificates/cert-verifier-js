import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate } from '../../src';
import domain from '../../src/domain';
import fixtureV1 from '../fixtures/v1/mainnet-valid-1.2.json';
import v1IssuerProfile from '../fixtures/v1/got-issuer_live.json';

describe('Certificate API Contract test suite', function () {
  describe('signers property', function () {
    describe('given there is only one signature to the blockcerts document', function () {
      let instance;

      beforeAll(async function () {
        const requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
        }).resolves(JSON.stringify(v1IssuerProfile));
        sinon.stub(domain.verifier, 'lookForTx').resolves({
          remoteHash: '68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728',
          issuingAddress: '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619',
          time: '2016-10-03T19:52:55.000Z',
          revokedAddresses: []
        });
        instance = new Certificate(fixtureV1);
        await instance.init();
        await instance.verify();
      });

      afterAll(function () {
        instance = null;
        sinon.restore();
      });

      it('should expose the signingDate', function () {
        expect(instance.signers[0].signingDate).toBe('2016-10-03T19:52:55.000Z');
      });

      it('should expose the signatureSuiteType', function () {
        expect(instance.signers[0].signatureSuiteType).toBe('MerkleProof2017');
      });

      it('should expose the issuerPublicKey', function () {
        expect(instance.signers[0].issuerPublicKey).toBe('1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619');
      });

      it('should expose the issuerName', function () {
        expect(instance.signers[0].issuerName).toBe('Game of thrones issuer on mainnet');
      });

      it('should expose the issuerProfileDomain', function () {
        expect(instance.signers[0].issuerProfileDomain).toBe('www.blockcerts.org');
      });

      it('should expose the issuerProfileUrl', function () {
        expect(instance.signers[0].issuerProfileUrl).toBe('http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json');
      });

      it('should expose the chain', function () {
        expect(instance.signers[0].chain).toBe(ExplorerLookup.BLOCKCHAINS.bitcoin);
      });

      it('should expose the transactionId', function () {
        expect(instance.signers[0].transactionId).toBe('8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d');
      });

      it('should expose the transactionLink', function () {
        expect(instance.signers[0].transactionLink).toBe('https://blockchain.info/tx/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d');
      });

      it('should expose the rawTransactionLink', function () {
        expect(instance.signers[0].rawTransactionLink).toBe('https://blockchain.info/rawtx/8623beadbc7877a9e20fb7f83eda6c1a1fc350171f0714ff6c6c4054018eb54d');
      });
    });
  });
});
