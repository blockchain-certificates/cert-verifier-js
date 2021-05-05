/**
 * @jest-environment jsdom
 */

import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';
const verifier = require('../../dist/verifier');

describe('verifier build test suite', function () {
  it('works as expected with a v1 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.TestnetV1Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    expect(result.message).toBe('The address used to issue this Blockcerts does not belong to the claimed issuer.');
  });

  it('works as expected with a v2 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    expect(result.message).toEqual({
      label: 'Verified',
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      linkText: 'View transaction link'
    });
  });

  it('works as expected with a v3 certificate', async function () {
    // cbor issue with jest only. Not sure what's up but I also believe we were getting false positives.
    const certificate = new verifier.Certificate(FIXTURES.BlockcertsV3AlphaCustomContext);
    await certificate.init();
    const result = await certificate.verify();
    if (result.status === VERIFICATION_STATUSES.FAILURE) {
      console.log(result.message);
    }
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    expect(result.message).toEqual({
      label: 'Verified',
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      linkText: 'View transaction link'
    });
  });
});
