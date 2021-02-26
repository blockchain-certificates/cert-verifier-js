import ensureMerkleRootEqual from '../../../src/inspectors/ensureMerkleRootEqual';

describe('Inspectors test suite', function () {
  describe('ensureMerkleRootEqual method', function () {
    const errorMessage = 'Merkle root does not match remote hash.';

    describe('given it is called with similar merkleRoot & remoteHash', function () {
      it('should not throw an error', function () {
        expect(function () {
          ensureMerkleRootEqual('similar', 'similar');
        }).not.toThrow();
      });
    });

    describe('given it is called with different merkleRoot & remoteHash', function () {
      it('should throw an error', function () {
        expect(function () {
          ensureMerkleRootEqual('merkle-root', 'remote-hash');
        }).toThrowError(errorMessage);
      });
    });
  });
});
