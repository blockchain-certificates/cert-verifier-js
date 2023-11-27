import jsonld from 'jsonld';
import VerifierError from '../models/verifierError';
import sha256 from 'sha256';
import { preloadedContexts } from '../constants';
import { toUTF8Data } from '../helpers/data';
import { getText } from '../domain/i18n/useCases';
import type { Blockcerts } from '../models/Blockcerts';
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

// prevent term in form of IRI must expand to definition error
// see https://github.com/digitalbazaar/jsonld.js/issues/542
const CONTEXT_BUFFER_PROPERTY_TO_PREVENT_NORMALIZATION_FAILURE = '__IMAGE__SIGNATURE__';

function adjustV1ContextForLegacySupport (contextDocument: any): any {
  if (!Array.isArray(contextDocument['@context']) ||
      (Array.isArray(contextDocument['@context']) && contextDocument['@context'][0]['image:signature'] == null)) {
    return contextDocument;
  }
  const ctxDocument = JSON.parse(JSON.stringify(contextDocument));
  // prevent term in form of IRI must expand to definition error
  // see https://github.com/digitalbazaar/jsonld.js/issues/542
  ctxDocument['@context'][0][CONTEXT_BUFFER_PROPERTY_TO_PREVENT_NORMALIZATION_FAILURE] = contextDocument['@context'][0]['image:signature'];
  delete ctxDocument['@context'][0]['image:signature'];
  return ctxDocument;
}

function adjustV1DocumentForLegacySupport (blockcertDocument: any): any {
  // prevent term in form of IRI must expand to definition error
  // see https://github.com/digitalbazaar/jsonld.js/issues/542
  if (blockcertDocument.document?.assertion?.['image:signature'] != null) {
    blockcertDocument.document.assertion[CONTEXT_BUFFER_PROPERTY_TO_PREVENT_NORMALIZATION_FAILURE] = blockcertDocument.document.assertion['image:signature'];
    delete blockcertDocument.document.assertion['image:signature'];
  }
  return blockcertDocument;
}

export default async function computeLocalHash (document: Blockcerts): Promise<string> {
  // the previous implementation was using a reference of @context, thus always adding @vocab to @context,
  // thus passing the information down to jsonld regardless of the configuration option. We explicitly do that now,
  // since we want to make sure unmapped fields are detected.
  if (Array.isArray(document['@context']) && !document['@context'].find((context: any) => isObject(context) && '@vocab' in context)) {
    document['@context'].push({ '@vocab': 'http://fallback.org/' });
  }
  const theDocument = adjustV1DocumentForLegacySupport(document);

  const customLoader = function (url): any {
    if (url in preloadedContexts) {
      return {
        contextUrl: null,
        document: adjustV1ContextForLegacySupport(preloadedContexts[url]),
        documentUrl: url
      };
    }
    return jsonld.documentLoader(url);
  };

  const normalizeArgs: any = {
    algorithm: 'URDNA2015',
    format: 'application/nquads',
    documentLoader: customLoader,
    safe: false
  };

  let normalizedDocument;
  try {
    normalizedDocument = await jsonld.normalize(theDocument.document, normalizeArgs);
  } catch (e) {
    console.error(e);
    throw new VerifierError('computeLocalHash', getText('errors', 'failedJsonLdNormalization'));
  }

  const unmappedFields: string[] = getUnmappedFields(normalizedDocument);
  if (unmappedFields) {
    throw new VerifierError(
      'computeLocalHash',
      `${getText('errors', 'foundUnmappedFields')}: ${unmappedFields.join(', ')}`
    );
  } else {
    return sha256(toUTF8Data(normalizedDocument));
  }
}
