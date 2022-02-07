import Certificate from '../../src/certificate';
import FIXTURES from '../fixtures';
import sinon from 'sinon';
import domain from '../../src/domain';

describe('End-to-end i18n test suite', function () {
  describe('given the language is set to spanish', function () {
    let certificate;
    let verificationResult;

    beforeEach(async function () {
      sinon.stub(domain.verifier, 'lookForTx').resolves({
        remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
        issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
        time: '2018-02-08T00:23:34.000Z',
        revokedAddresses: [
          '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
        ]
      });
      certificate = new Certificate(FIXTURES.MainnetV2Valid, { locale: 'es' });
      await certificate.init();
      verificationResult = await certificate.verify();
    });

    afterEach(function () {
      sinon.restore();
    });

    it('should set the locale to es', async function () {
      expect(certificate.locale).toBe('es');
    });

    it('should provide the verification in spanish', async function () {
      const expectedOutput = {
        code: 'final',
        message: {
          // eslint-disable-next-line no-template-curly-in-string
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
