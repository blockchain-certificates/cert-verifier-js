import v2EthFixture from '../../assertions/v2.0-ethereum-main-signature-merkle2017';
import v3EthFixture from '../../assertions/v3.0-alpha-signature-merkle2019';
import ensureValidReceipt from '../../../src/inspectors/ensureValidReceipt';
import certificateVersions from '../../../src/constants/certificateVersions';

describe('ensureValidReceipt inspector test suite', function () {
  describe('given it is called with a valid merkle root 2017 signature', function () {
    it('should not throw an error', function () {
      expect(() => {
        ensureValidReceipt(v2EthFixture, certificateVersions.V2_0);
      }).not.toThrow();
    });
  });

  describe('given it is called with a valid merkle root 2019 signature', function () {
    it('should not throw an error', function () {
      expect(() => {
        ensureValidReceipt(v3EthFixture, certificateVersions.V3_0_alpha);
      }).not.toThrow();
    });
  });

  describe('given it is a Blockcerts V3 and the receipt is signed with a Merkle Root 2017', function () {
    it('should throw an error', function () {
      const invalidFixture = JSON.parse(JSON.stringify(v3EthFixture));
      invalidFixture.proof = invalidFixture.path;
      delete invalidFixture.path;

      expect(() => {
        ensureValidReceipt(invalidFixture, certificateVersions.V3_0_alpha);
      }).toThrow(new Error('Merkle version used for signature is incompatible with Blockcerts version.'));
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
          ensureValidReceipt(invalidFixture, certificateVersions.V2_0);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({ left: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture, certificateVersions.V2_0);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the right path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({ right: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture, certificateVersions.V2_0);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path and the right path are not set', function () {
      it('should throw an error', function () {
        invalidFixture.proof.push({});
        expect(() => {
          ensureValidReceipt(invalidFixture, certificateVersions.V2_0);
        }).toThrow(new Error('The receipt is malformed. There was a problem navigating the merkle tree in the receipt.'));
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
          ensureValidReceipt(invalidFixture, certificateVersions.V3_0_alpha);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.path.push({ left: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture, certificateVersions.V3_0_alpha);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the right path is invalid', function () {
      it('should throw an error', function () {
        invalidFixture.path.push({ right: 'fonky' });
        expect(() => {
          ensureValidReceipt(invalidFixture, certificateVersions.V3_0_alpha);
        }).toThrow(new Error('Invalid Merkle Receipt. Proof hash did not match Merkle root'));
      });
    });

    describe('when the left path and the right path are not set', function () {
      it('should throw an error', function () {
        invalidFixture.path.push({});
        expect(() => {
          ensureValidReceipt(invalidFixture, certificateVersions.V3_0_alpha);
        }).toThrow(new Error('The receipt is malformed. There was a problem navigating the merkle tree in the receipt.'));
      });
    });
  });
});
