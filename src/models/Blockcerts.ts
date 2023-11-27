import type { BlockcertsV1 } from './BlockcertsV1';
import type { BlockcertsV2, UnsignedBlockcertsV2 } from './BlockcertsV2';
import type { BlockcertsV3, UnsignedBlockcertsV3 } from './BlockcertsV3';

export type Blockcerts = BlockcertsV1 | BlockcertsV2 | BlockcertsV3;
export type UnsignedBlockcerts = UnsignedBlockcertsV2 | UnsignedBlockcertsV3;

// defining input document properties below:
export type AnyProperties = Record<string, any>;

type CustomJsonLDContextDefinition = Record<string, {
  '@id'?: string;
  '@type'?: string;
} | string>;

export type JsonLDContext = Array<string | CustomJsonLDContextDefinition>;
