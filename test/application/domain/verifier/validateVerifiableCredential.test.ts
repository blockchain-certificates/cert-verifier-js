import { describe, it, expect } from 'vitest';
import validateVerifiableCredential from '../../../../src/domain/verifier/useCases/validateVerifiableCredential';
import validFixture from '../../../fixtures/v3/mocknet-vc-v2-name-description-multilingual.json';
import { CONTEXT_URLS } from '@blockcerts/schemas';
describe('domain verifier validateVerifiableCredential test suite', function () {
  describe('given the credential is well formed', function () {
    it('should not throw an error', function () {
      expect(function () {
        validateVerifiableCredential(validFixture);
      }).not.toThrow();
    });
  });

  describe('given the credential is malformed', function () {
    describe('validateType method', function () {
      describe('when the type is not an array', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, type: 'InvalidType' };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow('`type` property must be an array');
        });
      });

      describe('when the type does not include VerifiableCredential nor VerifiablePresentation', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, type: ['InvalidType'] };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow('`type` property must include `VerifiableCredential` or `VerifiablePresentation`');
        });
      });
    });

    describe('validateContext method', function () {
      describe('when the @context is not an array', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, '@context': validFixture['@context'][0] };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow('`@context` property must be an array');
        });
      });

      describe('when the first context is not that of Verifiable Credential', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, '@context': [CONTEXT_URLS.BLOCKCERTS_V3_2_CONTEXT, CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT] };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow(`First @context must be one of ${CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT}, ${CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT}, given ${CONTEXT_URLS.BLOCKCERTS_V3_2_CONTEXT}`);
        });
      });

      describe('when the context refers to VC v1 and VC v2', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, '@context': [CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT, CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT] };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow('Cannot have both v1 and v2 Verifiable Credential contexts');
        });
      });

      describe('when more than one type is specified but only one context is defined', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, '@context': [CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT] };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow(`More specific type: ${validFixture.type[1]} was detected but no additional context provided`);
        });
      });
    });

    describe('validateIssuer method', function () {
      describe('when the issuer is a string but not a valid URL', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, issuer: 'InvalidIssuerValue' };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow('`issuer` must be a URL string or an object with an `id` URL string');
        });
      });

      describe('when the issuer is an object but the id is not a valid URL', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, issuer: { id: 'InvalidIssuerValue' } };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow('`issuer` must be a URL string or an object with an `id` URL string');
        });
      });

      describe('when the issuer is an array', function () {
        it('should throw an error', function () {
          const fixture = { ...validFixture, issuer: ['InvalidIssuerValue'] };
          expect(function () {
            validateVerifiableCredential(fixture);
          }).toThrow('`issuer` must be a URL string or an object with an `id` URL string');
        });
      });

      describe('validateDateFormat method', function () {
        describe('when the credential is VC v1 spec', function () {
          describe('and the issuanceDate exists and is not a valid RFC3339 string', function () {
            it('should throw an error', function () {
              const fixture = {
                ...validFixture,
                '@context': [
                  CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT,
                  CONTEXT_URLS.BLOCKCERTS_V3_2_CONTEXT
                ],
                issuanceDate: '2024-11-13'
              };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('issuanceDate must be a valid RFC3339 string. Received: `2024-11-13`');
            });
          });

          describe('and the expirationDate exists and is not a valid RFC3339 string', function () {
            it('should throw an error', function () {
              const fixture = {
                ...validFixture,
                '@context': [
                  CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT,
                  CONTEXT_URLS.BLOCKCERTS_V3_2_CONTEXT
                ],
                expirationDate: '2024-11-13'
              };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('expirationDate must be a valid RFC3339 string. Received: `2024-11-13`');
            });
          });
        });

        describe('when the credential is VC v2 spec', function () {
          describe('and the validFrom date exists and is not a valid RFC3339 string', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, validFrom: '2024-11-13' };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('validFrom must be a valid RFC3339 string. Received: `2024-11-13`');
            });
          });

          describe('and the validUntil date exists and is not a valid RFC3339 string', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, validUntil: '2024-11-13' };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('validUntil must be a valid RFC3339 string. Received: `2024-11-13`');
            });
          });
        });
      });

      describe('validateCredentialStatus method', function () {
        describe('when the credentialStatus property is defined', function () {
          describe('when the property is an object but the id is not defined', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, credentialStatus: { type: 'BitStringStatusList' } };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('credentialStatus.id must be defined');
            });
          });

          describe('when the property is an object but the id is not a valid URL', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, credentialStatus: { type: 'BitStringStatusList', id: 'InvalidUrl' } };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('Invalid URL: InvalidUrl. Property: credentialStatus.id');
            });
          });

          describe('when the property is an object but the type is not defined', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, credentialStatus: { id: 'https://example.com' } };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('credentialStatus.type must be a string');
            });
          });

          describe('when the property is an array', function () {
            describe('and one of the objects does not have an id', function () {
              it('should throw an error', function () {
                const fixture = {
                  ...validFixture,
                  credentialStatus: [
                    {
                      type: 'BitStringStatusList',
                      id: 'https://example.com'
                    },
                    {
                      type: 'BitStringStatusList'
                    }
                  ]
                };
                expect(function () {
                  validateVerifiableCredential(fixture);
                }).toThrow('credentialStatus.id must be defined');
              });
            });

            describe('and one of the objects does not have a type', function () {
              it('should throw an error', function () {
                const fixture = {
                  ...validFixture,
                  credentialStatus: [
                    {
                      type: 'BitStringStatusList',
                      id: 'https://example.com'
                    },
                    {
                      id: 'https://other.example.com'
                    }
                  ]
                };
                expect(function () {
                  validateVerifiableCredential(fixture);
                }).toThrow('credentialStatus.type must be a string');
              });
            });

            describe('and one of the objects has an invalid URL for id', function () {
              it('should throw an error', function () {
                const fixture = {
                  ...validFixture,
                  credentialStatus: [
                    {
                      type: 'BitStringStatusList',
                      id: 'https://example.com'
                    },
                    {
                      id: 'InvalidUrl',
                      type: 'BitStringStatusList'
                    }
                  ]
                };
                expect(function () {
                  validateVerifiableCredential(fixture);
                }).toThrow('Invalid URL: InvalidUrl. Property: credentialStatus.id');
              });
            });
          });
        });
      });

      describe('validateCredentialSchema method', function () {
        describe('when the credentialSchema property is defined', function () {
          describe('when the property is an object but the id is not defined', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, credentialSchema: { type: 'JsonSchema' } };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('credentialSchema.id must be defined');
            });
          });

          describe('when the property is an object but the id is not a valid URL', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, credentialSchema: { type: 'JsonSchema', id: 'InvalidUrl' } };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('Invalid URL: InvalidUrl. Property: credentialSchema.id');
            });
          });

          describe('when the property is an object but the type is not defined', function () {
            it('should throw an error', function () {
              const fixture = { ...validFixture, credentialSchema: { id: 'https://example.com' } };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('credentialSchema.type must be `JsonSchema`');
            });
          });

          describe('when the property is an object but the type is not the correct value', function () {
            it('should throw an error', function () {
              const fixture = {
                ...validFixture,
                credentialSchema: {
                  id: 'https://example.com',
                  type: 'InvalidType'
                }
              };
              expect(function () {
                validateVerifiableCredential(fixture);
              }).toThrow('credentialSchema.type must be `JsonSchema`');
            });
          });

          describe('when the property is an array', function () {
            describe('and one of the objects does not have an id', function () {
              it('should throw an error', function () {
                const fixture = {
                  ...validFixture,
                  credentialSchema: [
                    {
                      type: 'JsonSchema',
                      id: 'https://example.com'
                    },
                    {
                      type: 'JsonSchema'
                    }
                  ]
                };
                expect(function () {
                  validateVerifiableCredential(fixture);
                }).toThrow('credentialSchema.id must be defined');
              });
            });

            describe('and one of the objects does not have a type', function () {
              it('should throw an error', function () {
                const fixture = {
                  ...validFixture,
                  credentialSchema: [
                    {
                      type: 'JsonSchema',
                      id: 'https://example.com'
                    },
                    {
                      id: 'https://other.example.com'
                    }
                  ]
                };
                expect(function () {
                  validateVerifiableCredential(fixture);
                }).toThrow('credentialSchema.type must be `JsonSchema`');
              });
            });

            describe('and one of the objects does not have the correct value', function () {
              it('should throw an error', function () {
                const fixture = {
                  ...validFixture,
                  credentialSchema: [
                    {
                      type: 'JsonSchema',
                      id: 'https://example.com'
                    },
                    {
                      id: 'https://other.example.com',
                      type: 'InvalidType'
                    }
                  ]
                };
                expect(function () {
                  validateVerifiableCredential(fixture);
                }).toThrow('credentialSchema.type must be `JsonSchema`');
              });
            });

            describe('and one of the objects has an invalid URL for id', function () {
              it('should throw an error', function () {
                const fixture = {
                  ...validFixture,
                  credentialSchema: [
                    {
                      type: 'JsonSchema',
                      id: 'https://example.com'
                    },
                    {
                      id: 'InvalidUrl',
                      type: 'JsonSchema'
                    }
                  ]
                };
                expect(function () {
                  validateVerifiableCredential(fixture);
                }).toThrow('Invalid URL: InvalidUrl. Property: credentialSchema.id');
              });
            });
          });
        });
      });
    });
  });
});
