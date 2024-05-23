import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate } from '../../src';
import MainnetV2Valid from '../fixtures/v2/mainnet-valid-2.0.json';
import v2IssuerProfile from '../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';

describe('Certificate API Contract test suite', function () {
  describe('signers property', function () {
    describe('given there is only one signature to the blockcerts document', function () {
      let instance;

      beforeAll(async function () {
        vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
          const explorerLookup = await importOriginal();
          return {
            ...explorerLookup,
            // replace some exports
            request: async function ({ url }) {
              if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json') {
                return JSON.stringify(v2IssuerProfile);
              }
            },
            lookForTx: () => ({
              remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
              issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
              time: '2018-02-08T00:23:34.000Z',
              revokedAddresses: []
            })
          };
        });
        instance = new Certificate(MainnetV2Valid);
        await instance.init();
        await instance.verify();
      });

      afterAll(function () {
        sinon.restore();
      });

      it('should expose the signingDate', function () {
        expect(instance.signers[0].signingDate).toBe('2018-02-07T23:52:16.636+00:00');
      });

      it('should expose the signatureSuiteType', function () {
        expect(instance.signers[0].signatureSuiteType).toBe('MerkleProof2017');
      });

      it('should expose the issuerPublicKey', function () {
        expect(instance.signers[0].issuerPublicKey).toBe('1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo');
      });

      it('should expose the issuerName', function () {
        expect(instance.signers[0].issuerName).toBe('Hyland Credentials');
      });

      it('should expose the issuerProfileDomain', function () {
        expect(instance.signers[0].issuerProfileDomain).toBe('blockcerts.learningmachine.com');
      });

      it('should expose the issuerProfileUrl', function () {
        expect(instance.signers[0].issuerProfileUrl).toBe('https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json');
      });

      it('should expose the chain', function () {
        expect(instance.signers[0].chain).toBe(ExplorerLookup.BLOCKCHAINS.bitcoin);
      });

      it('should expose the transactionId', function () {
        expect(instance.signers[0].transactionId).toBe('2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd');
      });

      it('should expose the transactionLink', function () {
        expect(instance.signers[0].transactionLink).toBe('https://blockchain.info/tx/2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd');
      });

      it('should expose the rawTransactionLink', function () {
        expect(instance.signers[0].rawTransactionLink).toBe('https://blockchain.info/rawtx/2378076e8e140012814e98a2b2cb1af07ec760b239c1d6d93ba54d658a010ecd');
      });
    });
  });
});
