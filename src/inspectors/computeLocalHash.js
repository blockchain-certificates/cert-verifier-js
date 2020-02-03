import CERTIFICATE_VERSIONS from '../constants/certificateVersions';
import CONFIG from '../constants/config';
import jsonld from 'jsonld';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import sha256 from 'sha256';
import { CONTEXTS as ContextsMap } from '../constants';
import { toUTF8Data } from '../helpers/data';
import { getText } from '../domain/i18n/useCases';

const {
  obi: OBI_CONTEXT,
  blockcerts: BLOCKCERTS_CONTEXT,
  blockcertsv1_2: BLOCKCERTSV1_2_CONTEXT,
  blockcertsv2: BLOCKCERTSV2_CONTEXT,
  blockcertsV3: BLOCKCERTSV3_CONTEXT,
  vc: VERIFIABLE_CRED_CTX,
  vc_exp: VERIFIABLE_CRED_EXAMPLE
} = ContextsMap;
const CONTEXTS = {};
// Preload contexts
CONTEXTS['https://w3id.org/blockcerts/schema/2.0-alpha/context.json'] = BLOCKCERTS_CONTEXT;
CONTEXTS['https://www.blockcerts.org/schema/2.0-alpha/context.json'] = BLOCKCERTS_CONTEXT;
CONTEXTS['https://w3id.org/openbadges/v2'] = OBI_CONTEXT;
CONTEXTS['https://openbadgespec.org/v2/context.json'] = OBI_CONTEXT;
CONTEXTS['https://w3id.org/blockcerts/v2'] = BLOCKCERTSV2_CONTEXT;
CONTEXTS['https://www.w3id.org/blockcerts/schema/2.0/context.json'] = BLOCKCERTSV2_CONTEXT;
CONTEXTS['https://w3id.org/blockcerts/v1'] = BLOCKCERTSV1_2_CONTEXT;

// V3
CONTEXTS['https://www.blockcerts.org/schema/3.0-alpha/context.json'] = BLOCKCERTSV3_CONTEXT;
CONTEXTS['https://www.w3.org/2018/credentials/v1'] = VERIFIABLE_CRED_CTX;
CONTEXTS['https://www.w3.org/2018/credentials/examples/v1'] = VERIFIABLE_CRED_EXAMPLE;

function getUnmappedFields (normalized) {
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

export default function computeLocalHash (document, version) {
  let expandContext = document['@context'];
  const theDocument = document;
  if (version === CERTIFICATE_VERSIONS.V2_0 && CONFIG.CheckForUnmappedFields) {
    if (expandContext.find(x => x === Object(x) && '@vocab' in x)) {
      expandContext = null;
    } else {
      expandContext.push({ '@vocab': 'http://fallback.org/' });
    }
  }

  const nodeDocumentLoader = jsonld.documentLoaders.node();
  const customLoader = function (url, callback) {
    if (url in CONTEXTS) {
      return callback(null, {
        contextUrl: null,
        document: CONTEXTS[url],
        documentUrl: url
      });
    }
    return nodeDocumentLoader(url, callback);
  };
  jsonld.documentLoader = customLoader;
  let normalizeArgs = {
    algorithm: 'URDNA2015',
    format: 'application/nquads',
    // protectedMode: 'warn'
  };
  if (expandContext) {
    normalizeArgs.expandContext = expandContext;
  }

  return new Promise((resolve, reject) => {
    jsonld.normalize(theDocument, normalizeArgs, (err, normalized) => {
      console.log(err);
      const isErr = !!err;
      if (isErr) {
        reject(
          new VerifierError(SUB_STEPS.computeLocalHash, getText('errors', 'failedJsonLdNormalization'))
        );
      } else {
        let unmappedFields = getUnmappedFields(normalized);
        if (unmappedFields) {
          reject(
            new VerifierError(
              SUB_STEPS.computeLocalHash,
              getText('errors', 'foundUnmappedFields')
            )
          ); // + unmappedFields.join(",")
        } else {
          console.log(normalized);
          resolve(sha256(toUTF8Data(normalized)));
        }
      }
    });
  });
}
