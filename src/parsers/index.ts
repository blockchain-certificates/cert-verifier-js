import parseV1 from './parseV1';
import parseV2 from './parseV2';
import parseV3 from './parseV3';

export const versionParserMap = {
  1: parseV1,
  2: parseV2,
  3: parseV3
};
