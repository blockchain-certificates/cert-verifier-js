import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../src';
import { universalResolverUrl } from '../../src/domain/did/valueObjects/didResolver';
import type { IVerificationStepCallbackAPI } from '../../src/verifier';
import BlockcertsV3 from '../fixtures/v3/testnet-v3-did.json';
import didDocument from '../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../fixtures/issuer-profile.json';

describe('when the certificate verified', function () {
  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
            return JSON.stringify({ didDocument });
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }
        },
        lookForTx: () => ({
          remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
          issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
          time: '2022-04-05T18:45:30.000Z',
          revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
        })
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('should have called the verification callback with the steps information', async function () {
    const calledSteps: Record<string, VERIFICATION_STATUSES> = {};
    function verificationCallback ({ code, status }: IVerificationStepCallbackAPI): void {
      calledSteps[code] = status;
    }
    const instance = new Certificate(BlockcertsV3);
    await instance.init();
    await instance.verify(verificationCallback);
    const expectedOutput = instance.verificationSteps.reduce((acc, curr) => {
      const subStepsCode = curr.subSteps.map(substep => substep.code);
      const suiteStepsCode = curr.suites?.flatMap(
        suite => suite.subSteps.map(substep => substep.code)
      ) ?? [];
      [...subStepsCode, ...suiteStepsCode].forEach(step => {
        acc[step] = VERIFICATION_STATUSES.SUCCESS;
      });
      return acc;
    }, {});
    expect(calledSteps).toEqual(expectedOutput);
  });
});
