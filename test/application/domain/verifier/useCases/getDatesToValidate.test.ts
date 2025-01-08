import { it, describe, expect } from 'vitest';
import fixture from '../../../../fixtures/v3/mocknet-vc-v2-validUntil-expired.json';
import domain from '../../../../../src/domain';
import type { DatesToValidate } from '../../../../../src/domain/verifier/useCases/getDatesToValidate';

describe('domain verifier getDatesToValidate test suite', function () {
  it('return the expected array of dates from the document', function () {
    const expected: DatesToValidate[] = [
      {
        dateTimeStamp: '2022-07-13T20:21:40.088Z',
        property: 'validFrom'
      },
      {
        dateTimeStamp: '2024-01-05T00:00:00.000Z',
        property: 'validUntil'
      },
      {
        dateTimeStamp: '2024-01-30T16:07:01Z',
        property: 'proof MerkleProof2019 created'
      }
    ];

    const result = domain.verifier.getDatesToValidate(fixture);
    expect(result).toEqual(expected);
  });
});
