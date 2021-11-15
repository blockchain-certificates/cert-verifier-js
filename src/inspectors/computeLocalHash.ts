import Versions, { isV1 } from '../constants/certificateVersions';
import CONFIG from '../constants/config';
import jsonld from 'jsonld';
import VerifierError from '../models/verifierError';
import { SUB_STEPS } from '../constants/verificationSubSteps';
import sha256 from 'sha256';
import { preloadedContexts } from '../constants';
import { toUTF8Data } from '../helpers/data';
import { getText } from '../domain/i18n/useCases';
import { Blockcerts } from '../models/Blockcerts';

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

export default async function computeLocalHash (document: Blockcerts, version: Versions): Promise<string> {
  let expandContext = document['@context'];
  const theDocument = document;
  if (!isV1(version) && CONFIG.CheckForUnmappedFields) {
    if (expandContext.find(x => x === Object(x) && '@vocab' in x)) {
      expandContext = null;
    } else {
      expandContext.push({ '@vocab': 'http://fallback.org/' });
    }
  }

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
  if (expandContext) {
    normalizeArgs.expandContext = expandContext;
  }

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
