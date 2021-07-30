import FIXTURES from '../../fixtures';
import parseJSON from '../../../src/parser';

const fixtureV1 = FIXTURES.TestnetV1Valid;
const fixtureV2 = FIXTURES.MainnetValidV2;
const fixtureBetaV3 = FIXTURES.MainnetValidV2;

describe('Parser test suite', function () {
  describe('given it is called with a Blockcerts v1', function () {
    it('should not return an incompatibility error message', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixtureV1));
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate).not.toEqual({
        error: 'The document you are trying to parse is not Blockcerts V1. Please refer to cert-verifier-js to parse and verify newer versions: https://github.com/blockchain-certificates/cert-verifier-js',
        isFormatValid: false
      });
    });
  });

  describe('given it is called with a Blockcerts v2', function () {
    it('should return an incompatibility error message', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixtureV2));
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate).toEqual({
        error: 'The document you are trying to parse is not Blockcerts V1. Please refer to cert-verifier-js to parse and verify newer versions: https://github.com/blockchain-certificates/cert-verifier-js',
        isFormatValid: false
      });
    });
  });

  describe('given it is called with a Blockcerts v3', function () {
    it('should return an incompatibility error message', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixtureBetaV3));
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate).toEqual({
        error: 'The document you are trying to parse is not Blockcerts V1. Please refer to cert-verifier-js to parse and verify newer versions: https://github.com/blockchain-certificates/cert-verifier-js',
        isFormatValid: false
      });
    });
  });
});
