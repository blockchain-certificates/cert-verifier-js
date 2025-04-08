import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import v2EthFixture from '../../assertions/v2.0-ethereum-main-signature-merkle2017.json';
import v3EthFixture from '../../assertions/v3.0-alpha-signature-merkle2019.json';
import ensureValidReceipt from '../../../src/inspectors/ensureValidReceipt';

describe('ensureValidReceipt inspector test suite', function () {
  describe('given it is called with a valid merkle root 2017 signature', function () {
    it('should not throw an error', function () {
      expect(() => {
        ensureValidReceipt(v2EthFixture);
      }).not.toThrow();
    });
  });

  describe('given it is called with a valid merkle root 2019 signature', function () {
    it('should not throw an error', function () {
      expect(() => {
        ensureValidReceipt(v3EthFixture);
      }).not.toThrow();
    });
  });

  describe('given it is called with an invalid merkle root 2017 signature', function () {
    let invalidFixture;

    beforeEach(function () {
      invalidFixture = JSON.parse(JSON.stringify(v2EthFixture));
    });

    afterEach(function () {
      invalidFixture = null;
    });

    describe('when the targetHash value does not match the merkleRoot value', function () {
      it('should throw an error', function () {
        invalidFixture.targetHash = 'fonky';
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('Invalid Merkle Receipt. Proof hash did not match Merkle root');
      });
    });

    describe('when the left path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({ left: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('Invalid Merkle Receipt. Proof hash did not match Merkle root');
      });
    });

    describe('when the right path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({ right: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('Invalid Merkle Receipt. Proof hash did not match Merkle root');
      });
    });

    describe('when the left path and the right path are not set', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({});
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('The receipt is malformed. There was a problem navigating the merkle tree in the receipt.');
      });
    });
  });

  describe('given it is called with an invalid merkle root 2019 signature', function () {
    let invalidFixture;

    beforeEach(function () {
      invalidFixture = JSON.parse(JSON.stringify(v3EthFixture));
    });

    afterEach(function () {
      invalidFixture = null;
    });

    describe('when the targetHash value does not match the merkleRoot value', function () {
      it('should throw an error', function () {
        invalidFixture.targetHash = 'fonky';
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('Invalid Merkle Receipt. Proof hash did not match Merkle root');
      });
    });

    describe('when the left path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.path.push({ left: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('Invalid Merkle Receipt. Proof hash did not match Merkle root');
      });
    });

    describe('when the right path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.path.push({ right: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('Invalid Merkle Receipt. Proof hash did not match Merkle root');
      });
    });

    describe('when the left path and the right path are not set', function () {
      it('should throw an error', function () {
        invalidFixture.path.push({});
        expect(() => {
          ensureValidReceipt(invalidFixture);
        }).toThrow('The receipt is malformed. There was a problem navigating the merkle tree in the receipt.');
      });
    });
  });
});
