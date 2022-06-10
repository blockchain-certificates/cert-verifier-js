import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';
import { FakeXmlHttpRequest } from './mocks/FakeXmlHttpRequest';
const verifier = require('../../dist/verifier-es');

// @ts-expect-error we just mock the thing
global.XMLHttpRequest = FakeXmlHttpRequest;

describe('verifier build test suite', function () {
  it('throws a deprecation error with a v1 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.TestnetV1Valid);
    expect(async () => {
      await certificate.init();
    }).rejects.toThrow('Verification of v1 certificates is not supported by this component. ' +
      'See the python cert-verifier for v1.1 verification ' +
      'or the npm package cert-verifier-js-v1-legacy for v1.2 ' +
      '(https://www.npmjs.com/package/@blockcerts/cert-verifier-js-v1-legacy)');
  });

  it('works as expected with a v2 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    if (result.status === VERIFICATION_STATUSES.FAILURE) {
      console.log(result.message);
    }
    expect(result.message).toEqual({
      label: 'Verified',
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      linkText: 'View transaction link'
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });

  it('works as expected with a v3 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.BlockcertsV3);
    await certificate.init();
    const result = await certificate.verify();
    if (result.status === VERIFICATION_STATUSES.FAILURE) {
      console.log(result.message);
    }
    expect(result.message).toEqual({
      label: 'Verified',
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      linkText: 'View transaction link'
    });
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
