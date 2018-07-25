import fixture from '../../fixtures/mainnet-valid-2.0';
import { BLOCKCHAINS, Certificate, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from '../../../src';
import Verifier from '../../../src/verifier';

describe('Verifier entity test suite', () => {
  const verifierParamFixture = {
    certificateJson: fixture,
    chain: BLOCKCHAINS.bitcoin,
    expires: fixture.expires,
    id: fixture.id,
    issuer: fixture.badge.issuer,
    receipt: fixture.signature,
    revocationKey: null,
    transactionId: fixture.signature.anchors[0].sourceId,
    version: CERTIFICATE_VERSIONS.V2_0
  };

  describe('constructor method', () => {
    describe('given all parameters are passed', () => {
      let verifierInstance = new Verifier(verifierParamFixture);

      it('should set the chain to the verifier object', () => {
        expect(verifierInstance.chain).toEqual(verifierParamFixture.chain);
      });

      it('should set the expires to the verifier object', () => {
        expect(verifierInstance.expires).toBe(verifierParamFixture.expires);
      });

      it('should set the id to the verifier object', () => {
        expect(verifierInstance.id).toBe(verifierParamFixture.id);
      });

      it('should set the issuer to the verifier object', () => {
        expect(verifierInstance.issuer).toEqual(verifierParamFixture.issuer);
      });

      it('should set the receipt to the verifier object', () => {
        expect(verifierInstance.receipt).toBe(verifierParamFixture.receipt);
      });

      it('should set the revocationKey to the verifier object', () => {
        expect(verifierInstance.revocationKey).toBe(verifierParamFixture.revocationKey);
      });

      it('should set the version to the verifier object', () => {
        expect(verifierInstance.version).toBe(verifierParamFixture.version);
      });

      it('should set the transactionId to the verifier object', () => {
        expect(verifierInstance.transactionId).toBe(verifierParamFixture.transactionId);
      });

      it('should set the documentToVerify to the verifier object', () => {
        const documentAssertion = JSON.parse(JSON.stringify(fixture));
        delete documentAssertion.signature;
        expect(verifierInstance.documentToVerify).toEqual(documentAssertion);
      });
    });
  });

  describe('isFailing method', function () {
    let verifierInstance;
    beforeEach(() => {
      verifierInstance = new Verifier(verifierParamFixture);
    });

    describe('when all checks are successful', function () {
      it('should return false', function () {
        verifierInstance._stepsStatuses.push({step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1'});
        verifierInstance._stepsStatuses.push({step: 'testStep 2', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 2'});

        expect(verifierInstance._isFailing()).toBe(false);
      });
    });
    describe('when one check is failing', function () {
      it('should return true', function () {
        verifierInstance._stepsStatuses.push({step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1'});
        verifierInstance._stepsStatuses.push({step: 'testStep 2', status: VERIFICATION_STATUSES.FAILURE, action: 'Test Step 2'});

        expect(verifierInstance._isFailing()).toBe(true);
      });
    });
  });
});
