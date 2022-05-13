import FIXTURES from '../../../fixtures';
import { BLOCKCHAINS } from '../../../../src/constants';
import parseJSON from '../../../../src/parsers/index';
import assertionIssuerProfile from '../../../assertions/v3.0-alpha-issuer-profile.json';
import assertionProofValue from '../../../assertions/v3.0-alpha-learningmachine-signature-merkle2019.json';

const fixture = FIXTURES.BlockcertsV3AlphaCustomContext;

describe('Parser test suite', function () {
  describe('given it is called with a invalid format v3 certificate data', function () {
    it('should set whether or not the certificate format is valid', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixture));
      delete fixtureCopy.proof;
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate.isFormatValid).toBe(false);
    });
  });

  describe('given it is called with valid v3 certificate data', function () {
    let parsedCertificate;

    beforeEach(async function () {
      parsedCertificate = await parseJSON(fixture);
    });

    afterEach(function () {
      parsedCertificate = null;
    });

    it('should set the chain of the certificate object', function () {
      expect(parsedCertificate.chain).toEqual(BLOCKCHAINS.testnet);
    });

    it('should set the id of the certificate object', function () {
      expect(parsedCertificate.id).toEqual(fixture.id);
    });

    it('should set issuedOn of the certificate object', function () {
      expect(parsedCertificate.issuedOn).toBe(fixture.issuanceDate);
    });

    it('should retrieve the issuer profile of the certificate object', function () {
      expect(parsedCertificate.issuer).toEqual(assertionIssuerProfile);
    });

    it('should set metadataJson of the certificate object', function () {
      expect(parsedCertificate.metadataJson).toEqual(fixture.metadataJson);
    });

    it('should set the receipt of the certificate object', function () {
      expect(parsedCertificate.receipt).toEqual(assertionProofValue);
    });

    it('should set the recipientFullName of the certificate object', function () {
      const fullNameAssertion = fixture.credentialSubject.name;
      expect(parsedCertificate.recipientFullName).toEqual(fullNameAssertion);
    });

    it('should set recordLink of the certificate object', function () {
      expect(parsedCertificate.recordLink).toBe(fixture.id);
    });

    describe('when the expirationDate is set', function () {
      it('should set the expires property', async function () {
        const fixtureCopy = JSON.parse(JSON.stringify(fixture));
        fixtureCopy.expirationDate = '2022-04-27T00:00:00Z';
        const parsedCertificate = await parseJSON(fixtureCopy);
        expect(parsedCertificate.expires).toEqual(fixtureCopy.expirationDate);
      });
    });
  });
});
