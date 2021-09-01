import domain from '../../../../../src/domain';
import assertionIonDidDocument from '../../../../assertions/ion-did-document.json';

describe('domain did resolve test suite', function () {
  describe('given the did method is supported by the resolver', function () {
    it('should resolve the did document', async function () {
      const didDocument = await domain.did.resolve('did:ion:EiD67XeFDwOoWM-kHktsm_z5BimilasvRaL1JiHKHdqrOA');
      expect(didDocument).toEqual(assertionIonDidDocument);
    });
  });
});
