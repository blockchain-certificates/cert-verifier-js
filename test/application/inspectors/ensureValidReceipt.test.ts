import fixtureV1 from '../../fixtures/v1/mainnet-valid-1.2.json';
import ensureValidReceipt from '../../../src/inspectors/ensureValidReceipt';

describe('ensureValidReceipt inspector test suite', function () {
  describe('given it is called with a valid merkle root 2017 signature', function () {
    it('should not throw an error', function () {
      expect(() => {
        ensureValidReceipt(fixtureV1.receipt);
      }).not.toThrow();
    });
  });

  describe('given it is called with an invalid merkle root 2017 signature', function () {
    let invalidFixture;

    beforeEach(function () {
      invalidFixture = JSON.parse(JSON.stringify(fixtureV1.receipt));
    });

    afterEach(function () {
      invalidFixture = null;
    });

    describe('when the targetHash value does not match the merkleRoot value', function () {
      it('should throw an error', function () {
        invalidFixture.targetHash = 'fonky';
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({ left: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the right path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({ right: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path and the right path are not set', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({});
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('The receipt is malformed. There was a problem navigating the merkle tree in the receipt.'));
      });
    });
  });
});
