import { retrieveVerificationMethodPublicKey } from '../../../../src/inspectors';

describe('retrieveVerificationMethodPublicKey test suite', function () {
  describe('given the verification method id is an absolute path', function () {
    it('should match the lookup key', function () {
      const fixtureDocument = {
        verificationMethod: [
          {
            id: 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q#key-1',
            controller: 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q',
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: {
              kty: 'EC',
              crv: 'secp256k1',
              x: '6_JKJIXL7PJQT9hnr03yQNda_fUfmfrcZpymkRqsmH4',
              y: 'steT4D8LrgwmqASd1EMy6ZyyAqsl-KvNlD7rBhX3za8',
              kid: '_0qG5QVt8vd6pbVGs5ReFJA4-yvYNEi4Ov1HZHTsobM'
            }
          }
        ]
      };
      const output = retrieveVerificationMethodPublicKey(
        fixtureDocument as any,
        'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q#key-1'
      );

      expect(output).toEqual(fixtureDocument.verificationMethod[0]);
    });
  });

  describe('given the verification method id is a relative path', function () {
    it('should match the lookup key', function () {
      const fixtureDocument = {
        verificationMethod: [
          {
            id: '#key-1',
            controller: 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q',
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: {
              kty: 'EC',
              crv: 'secp256k1',
              x: '6_JKJIXL7PJQT9hnr03yQNda_fUfmfrcZpymkRqsmH4',
              y: 'steT4D8LrgwmqASd1EMy6ZyyAqsl-KvNlD7rBhX3za8',
              kid: '_0qG5QVt8vd6pbVGs5ReFJA4-yvYNEi4Ov1HZHTsobM'
            }
          }
        ]
      };
      const output = retrieveVerificationMethodPublicKey(
        fixtureDocument as any,
        'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q#key-1'
      );

      expect(output).toEqual(fixtureDocument.verificationMethod[0]);
    });
  });

  describe('given the key has not been found', function () {
    it('should throw', function () {
      const fixtureDocument = {
        verificationMethod: [
          {
            id: '#key-2',
            controller: 'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q',
            type: 'EcdsaSecp256k1VerificationKey2019',
            publicKeyJwk: {
              kty: 'EC',
              crv: 'secp256k1',
              x: '6_JKJIXL7PJQT9hnr03yQNda_fUfmfrcZpymkRqsmH4',
              y: 'steT4D8LrgwmqASd1EMy6ZyyAqsl-KvNlD7rBhX3za8',
              kid: '_0qG5QVt8vd6pbVGs5ReFJA4-yvYNEi4Ov1HZHTsobM'
            }
          }
        ]
      };

      expect(() => {
        retrieveVerificationMethodPublicKey(
          fixtureDocument as any,
          'did:ion:EiBwVs4miVMfBd6KbQlMtZ_7oIWaQGVWVsKir6PhRg4m9Q#key-1'
        );
      }).toThrow('Issuer identity mismatch - The identity document provided by the issuer does not reference the verification method');
    });
  });
});
