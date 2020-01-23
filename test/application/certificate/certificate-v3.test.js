import { Certificate, CERTIFICATE_VERSIONS } from '../../../src';
import fixture from '../../fixtures/blockcerts-3.0-alpha';
import signatureAssertion from '../../assertions/v3.0-alpha-signature-merkle2019';

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

      it('should set the decoded signature to the certificate object', function () {
        expect(certificate.signature).toEqual(signatureAssertion);
      });
    });
  });
});
