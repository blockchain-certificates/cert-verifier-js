import FIXTURES from '../../../fixtures';
import parseV3 from '../../../../src/parsers/parseV3';
import Versions from '../../../../src/constants/certificateVersions';

import { TextEncoder, TextDecoder } from 'util';
import hashlinkAssertion from '../../../assertions/hashlink';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('Parser v3 test suite', function () {
  describe('given the certificate display html property contains hashlinks', function () {
    it('should return the display property with the updated urls', async function () {
      const fixture = FIXTURES.BlockcertsV3Hashlink;
      const parsedCertificate = await parseV3(fixture, Versions.V3_0);
      expect(parsedCertificate.display).toEqual(hashlinkAssertion);
    });
  });

  describe('given the certificate display html property does not contain hashlinks', function () {
    it('should return the display property as is', async function () {
      const fixture = FIXTURES.BlockcertsV3NoHashlink;
      const parsedCertificate = await parseV3(fixture, Versions.V3_0);
      expect(parsedCertificate.display).toEqual(fixture.display);
    });
  });

  describe('given the certificate display property is not html content', function () {
    it('should return the display property as is', async function () {
      const fixture = FIXTURES.BlockcertsV3NoHashlink;
      const parsedCertificate = await parseV3(fixture, Versions.V3_0);
      expect(parsedCertificate.display).toEqual(fixture.display);
    });
  });

  describe('given there is no certificate display property', function () {
    it('should return the display as undefined', async function () {
      const fixture = FIXTURES.BlockcertsV3Alpha;
      const parsedCertificate = await parseV3(fixture, Versions.V3_0);
      expect(parsedCertificate.display).toBeUndefined();
    });
  });
});
