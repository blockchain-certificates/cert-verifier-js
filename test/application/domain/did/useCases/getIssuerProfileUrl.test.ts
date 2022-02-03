import { getIssuerProfileUrl } from '../../../../../src/domain/did/useCases';
import didDocument from '../../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';

describe('domain did getIssuerProfileUrl test suite', function () {
  describe('given it is called with a DID document which does not contain a service object', function () {
    it('should return an empty string', function () {
      const fixtureDidDocument = JSON.parse(JSON.stringify(didDocument));
      delete fixtureDidDocument.service;
      const output = getIssuerProfileUrl(fixtureDidDocument);
      expect(output).toBe('');
    });
  });

  describe('given it is called with a DID document which contains a service object', function () {
    describe('and this object does not have a IssuerProfile type of service endpoint listed', function () {
      it('should return the service endpoint url', function () {
        const fixtureDidDocument = JSON.parse(JSON.stringify(didDocument));
        fixtureDidDocument.service[0].type = 'NotIssuerProfile';
        const output = getIssuerProfileUrl(fixtureDidDocument);
        expect(output).toBe('');
      });
    });
  });

  describe('given it is called with a DID document which contains a service object', function () {
    describe('and this object has a IssuerProfile type of service endpoint listed', function () {
      it('should return the service endpoint url', function () {
        const output = getIssuerProfileUrl(didDocument);
        expect(output).toBe('https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json');
      });
    });
  });
});
