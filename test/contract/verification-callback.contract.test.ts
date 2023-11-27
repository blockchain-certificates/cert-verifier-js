import sinon from 'sinon';
import * as domainVerifier from '../../src/domain/verifier/useCases';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { Certificate, VERIFICATION_STATUSES } from '../../src';
import type { IVerificationStepCallbackAPI } from '../../src/verifier';
import BlockcertsV1 from '../fixtures/v1/mainnet-valid-1.2.json';
import fixtureIssuerProfile from '../fixtures/v1/got-issuer_live.json';

describe('when the certificate verified', function () {
  beforeEach(function () {
    const requestStub = sinon.stub(ExplorerLookup, 'request');
    const lookForTxStub = sinon.stub(domainVerifier, 'lookForTx');
    requestStub.withArgs({
      url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
    lookForTxStub.resolves({
      remoteHash: '68f3ede17fdb67ffd4a5164b5687a71f9fbb68da803b803935720f2aa38f7728',
      issuingAddress: '1Q3P94rdNyftFBEKiN1fxmt2HnQgSCB619',
      time: '2016-10-03T19:52:55.000Z',
      revokedAddresses: []
    });
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should have called the verification callback with the steps information', async function () {
    const calledSteps: Record<string, VERIFICATION_STATUSES> = {};
    function verificationCallback ({ code, status }: IVerificationStepCallbackAPI): void {
      calledSteps[code] = status;
    }
    const instance = new Certificate(BlockcertsV1);
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
