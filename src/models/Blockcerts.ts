import { BlockcertsV1 } from './BlockcertsV1';
import { BlockcertsV2 } from './BlockcertsV2';
import { BlockcertsV3 } from './BlockcertsV3';

export type Blockcerts = BlockcertsV1 | BlockcertsV2 | BlockcertsV3;

// defining input document properties below:
export interface AnyProperties {
  [prop: string]: any;
}

interface CustomJsonLDContextDefinition {
  [key: string]: {
    '@id': string;
    '@type': string;
  };
}

export type JsonLDContext = Array<string | CustomJsonLDContextDefinition>;
