import type { BlockcertsV2, UnsignedBlockcertsV2 } from './BlockcertsV2';
import type { BlockcertsV3, UnsignedBlockcertsV3 } from './BlockcertsV3';

export type Blockcerts = BlockcertsV2 | BlockcertsV3;
export type UnsignedBlockcerts = UnsignedBlockcertsV2 | UnsignedBlockcertsV3;

// defining input document properties below:
export interface AnyProperties {
  [prop: string]: any;
}

interface CustomJsonLDContextDefinition {
  [key: string]: {
    '@id'?: string;
    '@type'?: string;
  } | string;
}

export type JsonLDContext = Array<string | CustomJsonLDContextDefinition>;
