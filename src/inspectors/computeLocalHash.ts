import { isV1 } from '../constants/certificateVersions';
import CONFIG from '../constants/config';
import jsonld from 'jsonld';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import sha256 from 'sha256';
import { preloadedContexts } from '../constants';
import { toUTF8Data } from '../helpers/data';
import { getText } from '../domain/i18n/useCases';

function setJsonLdDocumentLoader (): any {
  if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
    return jsonld.documentLoaders.xhr();
  }

  return jsonld.documentLoaders.node();
}

function getUnmappedFields (normalized): string[] | null {
  const myRegexp = /<http:\/\/fallback\.org\/(.*)>/;
  const matches = myRegexp.exec(normalized);
  if (matches) {
    const unmappedFields = [];
    for (let i = 0; i < matches.length; i++) {
      unmappedFields.push(matches[i]);
    }
    return unmappedFields;
  }
  return null;
}

export default async function computeLocalHash (document, version): Promise<string> {
  let expandContext = document['@context'];
  const theDocument = document;
  if (!isV1(version) && CONFIG.CheckForUnmappedFields) {
    if (expandContext.find(x => x === Object(x) && '@vocab' in x)) {
      expandContext = null;
    } else {
      expandContext.push({ '@vocab': 'http://fallback.org/' });
    }
  }

  const jsonldDocumentLoader = setJsonLdDocumentLoader();
  const customLoader = function (url, callback): any {
    if (url in preloadedContexts) {
      return callback(null, {
        contextUrl: null,
        document: preloadedContexts[url],
        documentUrl: url
      });
    }
    return jsonldDocumentLoader(url, callback);
  };
  jsonld.documentLoader = customLoader;
  const normalizeArgs: any = {
    algorithm: 'URDNA2015',
    format: 'application/nquads'
  };
  if (expandContext) {
    normalizeArgs.expandContext = expandContext;
  }

  return new Promise((resolve, reject) => {
    jsonld.normalize(theDocument, normalizeArgs, (err, normalized) => {
      const isErr = !!err;
      if (isErr) {
        console.error(err);
        reject(
          new VerifierError(SUB_STEPS.computeLocalHash, getText('errors', 'failedJsonLdNormalization'))
        );
      } else {
        const unmappedFields = getUnmappedFields(normalized);
        if (unmappedFields) {
          reject(
            new VerifierError(
              SUB_STEPS.computeLocalHash,
              `${getText('errors', 'foundUnmappedFields')}: ${unmappedFields.join(', ')}`
            )
          );
        } else {
          resolve(sha256(toUTF8Data(normalized)));
        }
      }
    });
  });
}
