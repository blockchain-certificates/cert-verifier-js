import { BLOCKCHAINS, Certificate, CERTIFICATE_VERSIONS } from '../../../src';
import fixture from '../../fixtures/blockcerts-3.0-alpha';
import signatureAssertion from '../../assertions/v3.0-alpha-signature-merkle2019';

const assertionTransactionId = '0xd8876609620d1839ea100523a6b8350779e2e517e356fe974739f58fd8ad2d40';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('given it is called with valid v3 certificate data', function () {
      let certificate;

      beforeEach(function () {
        certificate = new Certificate(fixture);
      });

      afterEach(function () {
        certificate = null;
      });

      it('should set version to the certificate object', function () {
        expect(certificate.version).toBe(CERTIFICATE_VERSIONS.V3_0_alpha);
      });

      it('should set the decoded signature as the receipt to the certificate object', function () {
        expect(certificate.receipt).toEqual(signatureAssertion);
      });

      it('should set the transactionId to the certificate object', function () {
        expect(certificate.transactionId).toEqual(assertionTransactionId);
      });

      it('should set the chain property', function () {
        expect(certificate.chain).toEqual(BLOCKCHAINS.ethropst);
      });

      it('should set the metadataJson property', function () {
        expect(certificate.metadataJson).toEqual(fixture.metadataJson);
      });

      it('should set the issuedOn property', function () {
        expect(certificate.issuedOn).toEqual(fixture.issuanceDate);
      });

      it('should set the rawTransactionLink property', function () {
        const rawTransactionLinkAssertion = `https://ropsten.etherscan.io/getRawTx?tx=${assertionTransactionId}`;
        expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
      });

      it('should set the transactionLink property', function () {
        const transactionLinkAssertion = `https://ropsten.etherscan.io/tx/${assertionTransactionId}`;
        expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
      });
    });
  });
});
