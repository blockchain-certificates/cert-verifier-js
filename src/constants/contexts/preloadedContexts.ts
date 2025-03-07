import { preloadedContexts } from '@blockcerts/schemas';
import CONTEXTS from './contexts-list';

/** V2 **/
// alpha
preloadedContexts['https://w3id.org/blockcerts/schema/2.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV2_ALPHA;
preloadedContexts['https://www.blockcerts.org/schema/2.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV2_ALPHA;

/** V3 **/
// alpha
preloadedContexts['https://www.blockcerts.org/schema/3.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV3_ALPHA;
preloadedContexts['https://w3id.org/blockcerts/schema/3.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV3_ALPHA;
preloadedContexts['https://w3id.org/blockcerts/v3.0-alpha'] = CONTEXTS.BLOCKCERTSV3_ALPHA;
// beta
preloadedContexts['https://www.blockcerts.org/schema/3.0-beta/context.json'] = CONTEXTS.BLOCKCERTSV3_BETA;
preloadedContexts['https://w3id.org/blockcerts/schema/3.0-beta/context.json'] = CONTEXTS.BLOCKCERTSV3_BETA;
preloadedContexts['https://w3id.org/blockcerts/v3.0-beta'] = CONTEXTS.BLOCKCERTSV3_BETA;

preloadedContexts['https://w3id.org/security/suites/ed25519-2020/v1'] = CONTEXTS.ED25519;
preloadedContexts['https://ns.did.ai/suites/secp256k1-2019/v1'] = CONTEXTS.SECP256K1_2019;
preloadedContexts['https://w3id.org/security/suites/secp256k1-2019/v1'] = CONTEXTS.SECP256K1_2019;
preloadedContexts['https://www.w3.org/ns/did/v1'] = CONTEXTS.DID_V1;

export default preloadedContexts;
