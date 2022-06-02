import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import FIXTURES from '../fixtures';
import { BLOCKCHAINS, Certificate } from '../../src';
import domain from '../../src/domain';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../assertions/v3.0-issuer-profile.json';
import v3RevocationList from '../assertions/v3-revocation-list';

describe('Certificate API Contract test suite', function () {
  describe('signers property', function () {
    describe('given there is only one signature to the V3 document', function () {
      let instance;
      let requestStub;
      let lookForTxStub;

      beforeEach(async function () {
        requestStub = sinon.stub(ExplorerLookup, 'request');
        requestStub.withArgs({
          url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
        }).resolves(JSON.stringify({ didDocument }));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
        }).resolves(JSON.stringify(fixtureIssuerProfile));
        requestStub.withArgs({
          url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json'
        }).resolves(JSON.stringify(v3RevocationList));
        lookForTxStub = sinon.stub(domain.verifier, 'lookForTx').resolves({
          remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2022-04-05T18:45:30.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        });
        instance = new Certificate(FIXTURES.BlockcertsV3);
        await instance.init();
        await instance.verify();
      });

      afterEach(function () {
        instance = null;
        sinon.restore();
      });

      it('should expose the signingDate', function () {
        expect(instance.signers[0].signingDate).toBe('2022-04-05T13:43:10.870521');
      });

      it('should expose the signatureSuiteType', function () {
        expect(instance.signers[0].signatureSuiteType).toBe('MerkleProof2019');
      });

      it('should expose the issuerPublicKey', function () {
        expect(instance.signers[0].issuerPublicKey).toBe('mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
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
        expect(instance.signers[0].chain).toBe(BLOCKCHAINS.testnet);
      });

      it('should expose the transactionId', function () {
        expect(instance.signers[0].transactionId).toBe('140ee9382a5c84433b9c89a5d9fea26c47415838b5841deb0c36a8a4b9121f2e');
      });

      it('should expose the transactionLink', function () {
        expect(instance.signers[0].transactionLink).toBe('https://testnet.blockchain.info/tx/140ee9382a5c84433b9c89a5d9fea26c47415838b5841deb0c36a8a4b9121f2e');
      });
    });
  });
});
