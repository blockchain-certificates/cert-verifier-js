import fixture from '../../fixtures/v1/mainnet-valid-1.2.json';
import { Certificate } from '../../../src';
import mainnetMapAssertion from '../../assertions/verification-steps-v1-mainnet';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import issuerProfileV1JsonFixture from '../../fixtures/v1/got-issuer_live.json';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('given it is called with valid v1 certificate data', function () {
      let certificate;
      let stubRequest;

      beforeEach(async function () {
        stubRequest = sinon.stub(ExplorerLookup, 'request');
        stubRequest.withArgs({
          url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
        }).resolves(JSON.stringify(issuerProfileV1JsonFixture));
        certificate = new Certificate(fixture);
        await certificate.init();
      });

      afterEach(function () {
        stubRequest.restore();
        certificate = null;
      });

      it('should set the certificateJson of the certificate object', function () {
        expect(certificate.certificateJson).toEqual(fixture);
      });

      it('should set certificateImage of the certificate object', function () {
        expect(certificate.certificateImage).toEqual(fixture.document.certificate.image);
      });

      it('should set description of the certificate object', function () {
        expect(certificate.description).toEqual(fixture.document.certificate.description);
      });

      it('should set expires of the certificate object', function () {
        expect(certificate.expires).toEqual((fixture as any).expires);
      });

      it('should set id of the certificate object', function () {
        expect(certificate.id).toEqual(fixture.document.assertion.uid);
      });

      it('should set issuedOn of the certificate object', function () {
        expect(certificate.issuedOn).toBe(fixture.document.assertion.issuedOn);
      });

      it('should set issuer of the certificate object', function () {
        expect(certificate.issuer).toEqual(issuerProfileV1JsonFixture);
      });

      it('should set metadataJson of the certificate object', function () {
        expect(certificate.metadataJson).toEqual((fixture as any).document.assertion.metadataJson);
      });

      it('should set name to the certificate object', function () {
        expect(certificate.name).toEqual(fixture.document.certificate.name);
      });

      it('should set recipientFullName of the certificate object', function () {
        const fullNameAssertion = fixture.document.recipient.givenName + ' ' + fixture.document.recipient.familyName;
        expect(certificate.recipientFullName).toEqual(fullNameAssertion);
      });

      it('should set recordLink of the certificate object', function () {
        expect(certificate.recordLink).toBe(fixture.document.assertion.id);
      });

      it('should set revocationKey of the certificate object', function () {
        expect(certificate.revocationKey).toEqual(fixture.document.recipient.revocationKey);
      });

      it('should set sealImage of the certificate object', function () {
        expect(certificate.sealImage).toEqual(fixture.document.certificate.issuer.image);
      });

      it('should set signature of the certificate object', function () {
        expect(certificate.signature).toEqual(fixture.document.signature);
      });

      it('should set 1 signatureImage to the certificate object', function () {
        expect(certificate.signatureImage.length).toEqual(1);
      });

      it('should set subtitle to the certificate object', function () {
        expect(certificate.subtitle).toEqual((fixture as any).document.certificate.subtitle);
      });

      it('should set verificationSteps to the certificate object', function () {
        expect(certificate.verificationSteps).toEqual(mainnetMapAssertion);
      });
    });
  });
});
