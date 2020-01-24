import v2EthFixture from '../../assertions/v2.0-ethereum-main-signature-merkle2017';
import v3EthFixture from '../../assertions/v3.0-alpha-signature-merkle2019';
import ensureValidReceipt from '../../../src/inspectors/ensureValidReceipt';

describe('ensureValidReceipt inspector test suite', function () {
  describe('given it is called with a valid merkle root 2017 signature', function () {
    it('should not throw an error', function () {
      expect(() => {
        ensureValidReceipt(v2EthFixture);
      }).not.toThrow();
    });
  });

  describe('given it is called with an valid merkle root 2017 signature', function () {
    describe('when the targetHash value does not match the merkleRoot value', function () {
      it('should throw an error', function () {
        const invalidFixture = JSON.parse(JSON.stringify(v2EthFixture));
        invalidFixture.targetHash = 'fonky';
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path is invalid', function () {
      it('should throw an error', function () {
        const invalidFixture = JSON.parse(JSON.stringify(v2EthFixture));
        invalidFixture.proof.push({left: 'fonky'});
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the right path is invalid', function () {
      it('should throw an error', function () {
        const invalidFixture = JSON.parse(JSON.stringify(v2EthFixture));
        invalidFixture.proof.push({right: 'fonky'});
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path and the right path are not set', function () {
      it('should throw an error', function () {
        const invalidFixture = JSON.parse(JSON.stringify(v2EthFixture));
        invalidFixture.proof.push({});
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow(new Error('The receipt is malformed. There was a problem navigating the merkle tree in the receipt.'));
      });
    });
  });
});
