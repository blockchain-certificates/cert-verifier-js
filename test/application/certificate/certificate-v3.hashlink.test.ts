import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';
import hashlinkAssertion from '../../assertions/hashlink';
import { Certificate } from '../../../src';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import BlockcertsV3Hashlink from '../../fixtures/v3/testnet-v3-hashlink.json';
import BlockcertsV3NoHashlink from '../../fixtures/v3/blockcerts-3.0-beta-did-ethereum-ropsten.json';
import BlockcertsV3Alpha from '../../fixtures/v3/blockcerts-3.0-alpha.json';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('Certificate v3 test suite', function () {
  let certificate;

  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
            return JSON.stringify({ didDocument });
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }

          if (url === 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json') {
            return JSON.stringify({
              '@context': [
                'https://w3id.org/openbadges/v2',
                'https://w3id.org/blockcerts/3.0'
              ],
              type: 'Profile',
              id: 'https://raw.githubusercontent.com/AnthonyRonning/https-github.com-labnol-files/master/issuer-eth.json',
              publicKey: [
                {
                  id: 'ecdsa-koblitz-pubkey:0x3d995ef85a8d1bcbed78182ab225b9f88dc8937c', // address may be different
                  created: '2018-01-01T21:10:10.615+00:00'
                }
              ]
            });
          }
        }
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  describe('given the certificate display html property contains hashlinks', function () {
    it.skip('should return the display property with the updated urls', async function () {
      // TODO: test is failing because the verification method does not match the issuer per say
      // why was is working before?
      const fixture = BlockcertsV3Hashlink;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toEqual(hashlinkAssertion);
    });
  });

  describe('given the certificate display html property does not contain hashlinks', function () {
    it('should return the display property as is', async function () {
      const fixture = BlockcertsV3NoHashlink;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toEqual(fixture.display);
    });
  });

  describe('given the certificate display property is not html content', function () {
    it('should return the display property as is', async function () {
      const fixture = BlockcertsV3NoHashlink;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toEqual(fixture.display);
    });
  });

  describe('given there is no certificate display property', function () {
    it('should return the display as undefined', async function () {
      const fixture = BlockcertsV3Alpha;
      certificate = new Certificate(fixture);
      await certificate.init();
      expect(certificate.display).toBeUndefined();
    });
  });
});
