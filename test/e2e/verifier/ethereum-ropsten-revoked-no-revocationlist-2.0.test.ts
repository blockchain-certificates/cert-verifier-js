import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import domain from '../../../src/domain';
import EthereumRopstenRevokedNoRevocationList from '../../fixtures/v2/ethereum-ropsten-revoked-no-revocationlist-2.0.json';

describe('given the certificate is a revoked certificate', function () {
  describe('and the revocationList is not provided in the certificate', function () {
    let certificate;
    let result;

    beforeAll(async function () {
      sinon.stub(domain.verifier, 'lookForTx').resolves({
        remoteHash: '6ad52e9db922e0c2648ce8f88f94b7e376daf9af60a7c782db75011f3783ea0a',
        issuingAddress: '0x7e30a37763e6ba1ffede1750bbefb4c60b17a1b3',
        time: '2019-10-15T09:20:24.000Z',
        revokedAddresses: []
      });
      const requestStub = sinon.stub(ExplorerLookup, 'request');
      requestStub.withArgs({
        url: 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json'
      }).resolves(JSON.stringify({
        '@context': [
          'https://w3id.org/openbadges/v2',
          'https://w3id.org/blockcerts/3.0'
        ],
        type: 'Profile',
        id: 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json',
        publicKey: [
          {
            id: 'ecdsa-koblitz-pubkey:0x7e30a37763e6ba1ffede1750bbefb4c60b17a1b3',
            created: '2018-01-01T21:10:10.615+00:00'
          }
        ],
        revocationList: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json'
      }));
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/revocation-list-blockcerts.json?assertionId=urn%3Auuid%3A3bc1a96a-3501-46ed-8f75-49612bbac211'
      }).resolves(JSON.stringify({
        revokedAssertions: [{
          id: 'urn:uuid:3bc1a96a-3501-46ed-8f75-49612bbac211',
          revocationReason: 'Testing revocation'
        }]
      }));
      certificate = new Certificate(EthereumRopstenRevokedNoRevocationList);
      await certificate.init();
      result = await certificate.verify();
    });

    afterAll(function () {
      sinon.restore();
    });

    it('should fail the verification', function () {
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('should report the revocation status', function () {
      expect(result.message).toBe('This certificate has been revoked by the issuer. Reason given: Testing revocation.');
    });
  });
});
