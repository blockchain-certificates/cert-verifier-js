import domain from '../../../../../src/domain';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS } from '../../../../../src';
import mocknetMapAssertion from './assertions/mocknetMapAssertion';
import v12MapAssertion from './assertions/v12MapAssertion';
import v20MapAssertion from './assertions/v20MapAssertion';

describe('domain certificates get verification map use case test suite', () => {
  describe('given it is called with the mocknet chain', () => {
    it('should return a mocknet verification map', () => {
      const result = domain.certificates.getVerificationMap(BLOCKCHAINS.mocknet);
      expect(result).toEqual(mocknetMapAssertion);
    });
  });

  describe('given it is called with the bitcoin chain', () => {
    describe('given it is called without a version', () => {
      it('should return an empty array', () => {
        const result = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin);
        expect(result).toEqual([]);
      });
    });

    describe('given it is called with a v1.2 version', () => {
      it('should return a mainnet v1.2 verification map', () => {
        const result = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin, CERTIFICATE_VERSIONS.V1_2);
        expect(result).toEqual(v12MapAssertion);
      });
    });

    describe('given it is called with a v2.0 version', () => {
      it('should return a mainnet v2.0 verification map', () => {
        const result = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin, CERTIFICATE_VERSIONS.V2_0);
        expect(result).toEqual(v20MapAssertion);
      });
    });
  });

  describe('given it is called without a chain and a version', () => {
    it('should return an empty array', () => {
      const result = domain.certificates.getVerificationMap();
      expect(result).toEqual([]);
    });
  });
});
