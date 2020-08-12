import sinon from 'sinon';
import fixture from '../../fixtures/v2/mainnet-valid-2.0.json';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS, VERIFICATION_STATUSES } from '../../../src';
import Verifier, { TExplorerAPIs } from '../../../src/verifier';
import { TransactionData } from '../../../src/models/TransactionData';
import { getDefaultExplorers } from '../../../src/explorers';
import { explorerFactory } from '../../../src/explorers/explorer';
import { ExplorerAPI } from '../../../src/certificate';
import { TRANSACTION_APIS } from '../../../src/constants/api';
import { SupportedChains } from '../../../src/constants/blockchains';
import * as RequestService from '../../../src/services/request';

describe('Verifier entity test suite', function () {
  let verifierInstance: Verifier;
  const verifierParamFixture = {
    certificateJson: fixture,
    chain: BLOCKCHAINS.bitcoin,
    expires: '',
    id: fixture.id,
    issuer: fixture.badge.issuer,
    receipt: fixture.signature,
    revocationKey: null,
    transactionId: fixture.signature.anchors[0].sourceId,
    version: CERTIFICATE_VERSIONS.V2_0,
    explorerAPIs: undefined
  };

  afterEach(function () {
    verifierInstance = null;
  });

  describe('constructor method', function () {
    /* eslint @typescript-eslint/no-unused-vars: "off" */
    let instance;

    beforeEach(function () {
      verifierInstance = new Verifier(verifierParamFixture);
    });

    describe('given all parameters are passed', function () {
      it('should set the chain to the verifier object', function () {
        expect(verifierInstance.chain).toEqual(verifierParamFixture.chain);
      });

      it('should set the expires to the verifier object', function () {
        expect(verifierInstance.expires).toBe(verifierParamFixture.expires);
      });

      it('should set the id to the verifier object', function () {
        expect(verifierInstance.id).toBe(verifierParamFixture.id);
      });

      it('should set the issuer to the verifier object', function () {
        expect(verifierInstance.issuer).toEqual(verifierParamFixture.issuer);
      });

      it('should set the receipt to the verifier object', function () {
        expect(verifierInstance.receipt).toBe(verifierParamFixture.receipt);
      });

      it('should set the revocationKey to the verifier object', function () {
        expect(verifierInstance.revocationKey).toBe(verifierParamFixture.revocationKey);
      });

      it('should set the version to the verifier object', function () {
        expect(verifierInstance.version).toBe(verifierParamFixture.version);
      });

      it('should set the transactionId to the verifier object', function () {
        expect(verifierInstance.transactionId).toBe(verifierParamFixture.transactionId);
      });

      describe('explorerAPIs', function () {
        describe('when it is undefined or null', function () {
          it('should not define a custom property to the instance explorerAPIs property', function () {
            expect(verifierInstance.explorerAPIs.custom).toBeUndefined();
          });
        });

        describe('when it is a valid custom explorer API object', function () {
          describe('and the custom explorer API has a priority set to -1', function () {
            it('should throw an error', function () {
              const fixture = Object.assign({}, verifierParamFixture);
              const fixtureExplorerAPI: ExplorerAPI[] = [{
                serviceURL: 'https://explorer-example.com',
                priority: -1,
                parsingFunction: (): TransactionData => {
                  return {
                    remoteHash: 'a',
                    issuingAddress: 'b',
                    time: 'c',
                    revokedAddresses: ['d']
                  };
                }
              }];
              fixture.explorerAPIs = fixtureExplorerAPI;
              const expectedExplorers: TExplorerAPIs = getDefaultExplorers();
              expectedExplorers.custom = explorerFactory(fixtureExplorerAPI);

              expect(() => {
                instance = new Verifier(fixture);
              }).toThrow('One or more of your custom explorer APIs has a priority set below zero');
            });
          });

          describe('and the custom explorer API has a missing parsing function', function () {
            it('should throw an error', function () {
              const fixture = Object.assign({}, verifierParamFixture);
              const fixtureExplorerAPI: ExplorerAPI[] = [{
                serviceURL: 'https://explorer-example.com',
                priority: 0,
                parsingFunction: undefined
              }];
              fixture.explorerAPIs = fixtureExplorerAPI;
              const expectedExplorers: TExplorerAPIs = getDefaultExplorers();
              expectedExplorers.custom = explorerFactory(fixtureExplorerAPI);

              expect(() => {
                instance = new Verifier(fixture);
              }).toThrow('One or more of your custom explorer APIs does not have a parsing function');
            });
          });

          describe('and the custom explorer API object is valid', function () {
            it('should set the explorerAPIs to the verifier object', function () {
              const fixture = Object.assign({}, verifierParamFixture);
              const fixtureExplorerAPI: ExplorerAPI[] = [{
                serviceURL: 'https://explorer-example.com',
                priority: 0,
                parsingFunction: (): TransactionData => {
                  return {
                    remoteHash: 'a',
                    issuingAddress: 'b',
                    time: 'c',
                    revokedAddresses: ['d']
                  };
                }
              }];
              fixture.explorerAPIs = fixtureExplorerAPI;
              const expectedExplorers: TExplorerAPIs = getDefaultExplorers();
              expectedExplorers.custom = explorerFactory(fixtureExplorerAPI);
              const verifierInstance = new Verifier(fixture);
              expect(JSON.stringify(verifierInstance.explorerAPIs)).toEqual(JSON.stringify(expectedExplorers));
            });
          });

          describe('and it references a default explorer API used for multiple blockchains', function () {
            let requestStub: sinon.SinonStub;
            let instance: Verifier;
            const fixtureServiceURL = 'a-totally-custom-url';

            beforeAll(function () {
              requestStub = sinon.stub(RequestService, 'request').resolves(JSON.stringify({}));
              const fixtureExplorerAPI: ExplorerAPI[] = [{
                serviceName: TRANSACTION_APIS.blockcypher,
                serviceURL: fixtureServiceURL,
                keyPropertyName: 'apiKey',
                key: 'a-custom-api-key',
                parsingFunction: () => ({ // prevent throwing error when executing
                  remoteHash: 'a',
                  issuingAddress: 'b',
                  time: 'c',
                  revokedAddresses: ['d']
                })
              }];
              instance = new Verifier({
                ...verifierParamFixture,
                explorerAPIs: fixtureExplorerAPI
              });
            });

            afterAll(function () {
              requestStub.restore();
            });

            it('should merge and overwrite the first occurrence of the default explorer API info with the provided one', async function () {
              await instance.explorerAPIs.ethereum[1].getTxData('transaction-id', SupportedChains.Ethmain);
              expect(requestStub.firstCall.args[0]).toEqual({ url: `${fixtureServiceURL}?apiKey=a-custom-api-key` });
            });

            it('should merge and overwrite the second occurrence of the default explorer API info with the provided one', async function () {
              await instance.explorerAPIs.bitcoin[0].getTxData('transaction-id', SupportedChains.Bitcoin);
              expect(requestStub.secondCall.args[0]).toEqual({ url: `${fixtureServiceURL}?apiKey=a-custom-api-key` });
            });
          });
        });
      });

      it('should set the documentToVerify to the verifier object', function () {
        const documentAssertion = JSON.parse(JSON.stringify(fixture));
        delete documentAssertion.signature;
        expect(verifierInstance.documentToVerify).toEqual(documentAssertion);
      });
    });
  });

  describe('isFailing method', function () {
    beforeEach(function () {
      verifierInstance = new Verifier(verifierParamFixture);
    });

    describe('when all checks are successful', function () {
      it('should return false', function () {
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 2' });

        expect(verifierInstance._isFailing()).toBe(false);
      });
    });
    describe('when one check is failing', function () {
      it('should return true', function () {
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1' });
        (verifierInstance as any)._stepsStatuses.push({ step: 'testStep 2', status: VERIFICATION_STATUSES.FAILURE, action: 'Test Step 2' });

        expect(verifierInstance._isFailing()).toBe(true);
      });
    });
  });

  describe('_verifyMain method', function () {
    // TODO: test other steps

    describe('lookForTx step', function () {
      it('should call the explorers sent by the verifier', async function () {
        const mockTxData: TransactionData = {
          revokedAddresses: [],
          time: '2020-04-20T00:00:00Z',
          remoteHash: 'a-remote-hash',
          issuingAddress: 'an-issuing-address'
        };
        const stubbedExplorer = {
          getTxData: sinon.stub().resolves(mockTxData)
        };
        const verifierInstance = new Verifier(verifierParamFixture);
        verifierInstance.explorerAPIs.bitcoin[0] = stubbedExplorer;
        await verifierInstance.verify();
        expect(stubbedExplorer.getTxData.calledOnce).toBe(true);
      });
    });
  });
});
