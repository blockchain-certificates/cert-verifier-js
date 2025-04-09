import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Certificate from '../../src/certificate';
import MainnetV2Valid from '../fixtures/v2/mainnet-valid-2.0.json';
import fixtureIssuerProfile from '../fixtures/issuer-profile-mainnet-example.json';

describe('End-to-end i18n test suite', function () {
  describe('given the language is set to spanish', function () {
    let certificate;
    let verificationResult;

    beforeAll(async function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          // replace some exports
          request: async function ({ url }) {
            if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json') {
              return JSON.stringify(fixtureIssuerProfile);
            }
          },
          lookForTx: () => ({
            remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
            issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
            time: '2018-02-08T00:23:34.000Z',
            revokedAddresses: [
              '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
            ]
          })
        };
      });
      certificate = new Certificate(MainnetV2Valid, { locale: 'es' });
      await certificate.init();
      verificationResult = await certificate.verify();
    });

    afterAll(function () {
      vi.restoreAllMocks();
    });

    it('should set the locale to es', async function () {
      expect(certificate.locale).toBe('es');
    });

    it('should provide the verification in spanish', async function () {
      const expectedOutput = {
        code: 'final',
        message: {
          description: 'Este es un certificado válido de ${chain}.',
          label: 'Verificado',
          linkText: 'Ver enlace de transacción'
        },
        status: 'success'
      };
      expect(verificationResult).toEqual(expectedOutput);
    });
  });
});
