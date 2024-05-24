import { describe, it, expect } from 'vitest';
import DidResolver, { universalResolverUrl } from '../../../../../src/domain/did/valueObjects/didResolver';

describe('didResolverUrl value object test suite', function () {
  it('should default to the DIF resolver url', function () {
    expect(DidResolver.url).toBe(universalResolverUrl);
  });

  it('should set the value', function () {
    const customUrlValue = 'https://resolver.blockcerts.org';
    DidResolver.url = customUrlValue;
    expect(DidResolver.url).toBe(customUrlValue);
  });
});
