import domain from '../../../../../src/domain';
import assertionIonDidDocument from '../../../../assertions/ion-did-document.json';

describe('domain did resolve test suite', function () {
  describe('given the did method is supported by the resolver', function () {
    it('should resolve the did document', async function () {
      const didDocument = await domain.did.resolve('did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q');
      expect(didDocument).toEqual(assertionIonDidDocument);
    });
  });
});
