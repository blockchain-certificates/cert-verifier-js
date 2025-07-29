import { describe, it, expect } from 'vitest';
import { publicKeyHexFromJwkSecp256k1, publicKeyBase58FromPublicKeyHex, jwkToMultibaseEd25519 } from '../../../src/helpers/keyUtils';

describe('Key Utils Test Suite', function () {
  describe('publicKeyHexFromJwkSecp256k1', function () {
    it('should convert JWK to hex encoded public key', function () {
      const jwk = {
        "kty": "EC",
        "crv": "secp256k1",
        "x": "6_JKJIXL7PJQT9hnr03yQNda_fUfmfrcZpymkRqsmH4",
        "y": "steT4D8LrgwmqASd1EMy6ZyyAqsl-KvNlD7rBhX3za8",
        "kid": "_0qG5QVt8vd6pbVGs5ReFJA4-yvYNEi4Ov1HZHTsobM"
      };
      const result = publicKeyHexFromJwkSecp256k1(jwk);
      expect(result).toBe('03ebf24a2485cbecf2504fd867af4df240d75afdf51f99fadc669ca6911aac987e');
    });
  });

  describe('publicKeyBase58FromPublicKeyHex', function () {
    it('should convert hex encoded public key to base58', function () {
      const hex = '03ebf24a2485cbecf2504fd867af4df240d75afdf51f99fadc669ca6911aac987e';
      const result = publicKeyBase58FromPublicKeyHex(hex);
      expect(result).toBe('2AZzCmy8gwULj4GPCm8sq47T3tg5rYgwKQp42Vw9cvdLh');
    });
  });

  describe('jwkToMultibaseEd25519', function () {
    it('should convert JWK to Multibase encoded public key', function () {
      const jwk = {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'knV0ocrjDZh-INn5Rxu_qJgcMs5efAA2_j07uwJpHCA'
      };
      const result = jwkToMultibaseEd25519(jwk);
      expect(result).toBe('z6MkpJySvETLnxhQG9DzEdmKJtysBDjuuTeDfUj1uNNCUqcj');
    });
  });
});
