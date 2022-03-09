import sinon from 'sinon';
import { TextEncoder, TextDecoder } from 'util';
import FIXTURES from '../../fixtures';
import hashlinkAssertion from '../../assertions/hashlink';
import { Certificate } from '../../../src';
import domain from '../../../src/domain';
import v3IssuerProfile from '../../assertions/v3.0-issuer-profile.json';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('Certificate v3 test suite', function () {
  let certificate;
  let getIssuerProfileStub;

  beforeEach(function () {
    getIssuerProfileStub = sinon.stub(domain.verifier, 'getIssuerProfile').resolves({
      ...v3IssuerProfile,
      didDocument
    });
  });

  afterEach(function () {
    certificate = null;
    getIssuerProfileStub.restore();
  });

  describe('given the certificate display html property contains hashlinks', function () {
    it('should return the display property with the updated urls', async function () {
      const fixture = FIXTURES.BlockcertsV3Hashlink;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toEqual(hashlinkAssertion);
    });
  });

  describe('given the certificate display html property does not contain hashlinks', function () {
    it('should return the display property as is', async function () {
      const fixture = FIXTURES.BlockcertsV3NoHashlink;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toEqual(fixture.display);
    });
  });

  describe('given the certificate display property is not html content', function () {
    it('should return the display property as is', async function () {
      const fixture = FIXTURES.BlockcertsV3NoHashlink;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toEqual(fixture.display);
    });
  });

  describe('given there is no certificate display property', function () {
    it('should return the display as undefined', async function () {
      const fixture = FIXTURES.BlockcertsV3Alpha;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toBeUndefined();
    });
  });
});
