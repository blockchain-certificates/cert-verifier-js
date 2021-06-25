import domain from '../../../../../src/domain';
import assertionIonDidDocument from '../../../../assertions/ion-did-document.json';

describe('domain did resolve test suite', function () {
  describe('given the did method is supported by the resolver', function () {
    it('should resolve the did document', async function () {
      const didDocument = await domain.did.resolve('did:ion:test:EiA_-7-VnxXffIXqC0Fb6H9SgkkjKyThVo_WgWItyeXsZw');
      expect(didDocument).toEqual(assertionIonDidDocument);
    });
  });

  describe('given the method is not supported by the resolver', function () {
    it('should throw', async function () {
      await expect(async () => {
        await domain.did.resolve('did:example:123345767890');
      })
        .rejects
        .toThrow('Unsupported did method: example used with blockcerts document');
    });
  });
});
