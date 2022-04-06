import CONFIG from '../constants/config';
import jsonld from 'jsonld';
import VerifierError from '../models/verifierError';
import { SUB_STEPS } from '../constants/verificationSubSteps';
import sha256 from 'sha256';
import { preloadedContexts } from '../constants';
import { toUTF8Data } from '../helpers/data';
import { getText } from '../domain/i18n/useCases';
import type { Blockcerts, UnsignedBlockcerts } from '../models/Blockcerts';
import retrieveUnsignedBlockcerts from '../parsers/helpers/retrieveUnsignedBlockcerts';
import { isObject } from '../helpers/object';

export function getUnmappedFields (normalized: string): string[] | null {
  const normalizedArray = normalized.split('\n');
  const myRegexp = /<http:\/\/fallback\.org\/(.*)>/;
  const matches = normalizedArray
    .map(normalizedString => myRegexp.exec(normalizedString))
    .filter(match => match != null);
  if (matches.length > 0) {
    const unmappedFields = matches.map(match => match[1]).sort(); // only return name of unmapped key
    return Array.from(new Set(unmappedFields)); // dedup
  }
  return null;
}

export default async function computeLocalHash (document: Blockcerts): Promise<string> {
  // the previous implementation was using a reference of @context, thus always adding @vocab to @context,
  // thus passing the information down to jsonld regardless of the configuration option. We explicitly do that now,
  // since we want to make sure unmapped fields are detected.
  if (!document['@context'].find((context: any) => isObject(context) && '@vocab' in context)) {
    document['@context'].push({ '@vocab': 'http://fallback.org/' });
  }
  const theDocument: UnsignedBlockcerts = retrieveUnsignedBlockcerts(document);

  const customLoader = function (url): any {
    if (url in preloadedContexts) {
      return {
        contextUrl: null,
        document: preloadedContexts[url],
        documentUrl: url
      };
    }
    return jsonld.documentLoader(url);
  };

  const normalizeArgs: any = {
    algorithm: 'URDNA2015',
    format: 'application/nquads',
    documentLoader: customLoader
  };

  let normalizedDocument;
  try {
    normalizedDocument = await jsonld.normalize(theDocument, normalizeArgs);
  } catch (e) {
    console.error(e);
    throw new VerifierError(SUB_STEPS.computeLocalHash, getText('errors', 'failedJsonLdNormalization'));
  }

  const unmappedFields: string[] = getUnmappedFields(normalizedDocument);
  if (unmappedFields) {
    throw new VerifierError(
      SUB_STEPS.computeLocalHash,
      `${getText('errors', 'foundUnmappedFields')}: ${unmappedFields.join(', ')}`
    );
  } else {
    return sha256(toUTF8Data(normalizedDocument));
  }
}
