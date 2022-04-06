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

export default preloadedContexts;
