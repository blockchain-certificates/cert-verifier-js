import { preloadedContexts } from '@blockcerts/schemas';
import CONTEXTS from './contexts-list';

/** V1 **/
preloadedContexts['https://w3id.org/blockcerts/v1'] = CONTEXTS.BLOCKCERTSV1_2;
preloadedContexts['https://w3id.org/chainpoint/v2'] = CONTEXTS.CHAINPOINT_V2;

export default preloadedContexts;
