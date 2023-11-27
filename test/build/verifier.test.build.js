/**
 * @jest-environment jsdom
 */

import v1Fixture from '../fixtures/v1/mainnet-valid-1.2.json';
import v2Fixture from '../fixtures/v2/ethereum-main-valid-2.0.json';
import v3Fixture from '../fixtures/v3/proof-chain-example-secp256k1.json';
import { FakeXmlHttpRequest } from './mocks/FakeXmlHttpRequest';
import crypto from 'crypto';
const verifier = require('../../dist/verifier');

// @ts-expect-error we just mock the thing
global.XMLHttpRequest = FakeXmlHttpRequest;
global.crypto.subtle = crypto.webcrypto.subtle;

describe('verifier build test suite', function () {
  it('verifies v1 certificate', async function () {
    const certificate = new verifier.Certificate(v1Fixture);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.message).toEqual({
      label: 'Verified',
      // eslint-disable-next-line no-template-curly-in-string
      description: 'This is a valid ${chain} certificate.',
      linkText: 'View transaction link'
    });
    expect(result.status).toBe('success');
  });

  it('does not support v2 verification', async function () {
    expect(async () => {
      const certificate = new verifier.Certificate(v2Fixture);
      await certificate.init();
    }).rejects.toThrow('not supported');
  });

  it('does not support v3 verification', async function () {
    expect(async () => {
      const certificate = new verifier.Certificate(v3Fixture);
      await certificate.init();
    }).rejects.toThrow('not supported');
  });
});
