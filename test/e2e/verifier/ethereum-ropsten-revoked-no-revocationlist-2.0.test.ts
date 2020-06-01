import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import FIXTURES from '../../fixtures';
import * as Explorers from '../../../src/explorers/explorer';
import sinon from 'sinon';
import etherscanApiWithKey from '../../data/etherscan-key';

describe('given the certificate is a revoked certificate', function () {
  describe('and the revocationList is not provided in the certificate', function () {
    let certificate;
    let result;

    beforeAll(async function () {
      sinon.stub(Explorers, 'getTransactionFromApi').resolves({
        remoteHash: '6ad52e9db922e0c2648ce8f88f94b7e376daf9af60a7c782db75011f3783ea0a',
        issuingAddress: '0x7e30a37763e6ba1ffede1750bbefb4c60b17a1b3',
        time: '2019-10-15T09:20:24.000Z',
        revokedAddresses: []
      });
      certificate = new Certificate(FIXTURES.EthereumRopstenRevokedNoRevocationList, { explorerAPIs: [etherscanApiWithKey] });
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
