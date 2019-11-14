import { request } from '../../../src/services/request';

describe('Services Request test suite', function () {
  describe('given it is called without a URL', function () {
    it('should throw an error', async function () {
      await request({}).catch(err => {
        expect(err.message).toBe('URL is missing');
      });
    });
  });
});
