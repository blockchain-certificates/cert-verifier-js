import { Certificate } from '../../src';
import FIXTURES from '../fixtures';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../fixtures/issuer-profile.json';
import v2IssuerProfile from '../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import domain from '../../src/domain';

describe('Certificate API Contract test suite', function () {
  describe('issuer publicKey property', function () {
    let requestStub;

    beforeEach(function () {
      requestStub = sinon.stub(ExplorerLookup, 'request');
    });

    afterEach(function () {
      sinon.restore();
    });

    it('is available for a MerkleProof2017 signed certificate', async function () {
      requestStub.withArgs({
        url: 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json'
      }).resolves(JSON.stringify(v2IssuerProfile));
      sinon.stub(domain.verifier, 'lookForTx').resolves({
        remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
        issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
        time: '2018-02-08T00:23:34.000Z',
        revokedAddresses: []
      });
      const instance = new Certificate(FIXTURES.MainnetV2Valid);
      await instance.init();
      await instance.verify();
      expect(instance.publicKey).toEqual('1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo');
    });

    it('is available for a MerkleProof2019 signed certificate', async function () {
      requestStub.withArgs({
        url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
      }).resolves(JSON.stringify({ didDocument }));
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
      }).resolves(JSON.stringify(fixtureIssuerProfile));
      sinon.stub(domain.verifier, 'lookForTx').resolves({
        remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
        issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
        time: '2022-04-05T18:45:30.000Z',
        revokedAddresses: []
      });
      const instance = new Certificate(FIXTURES.BlockcertsV3);
      await instance.init();
      await instance.verify();
      expect(instance.publicKey).toEqual('mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
    });
  });
});
