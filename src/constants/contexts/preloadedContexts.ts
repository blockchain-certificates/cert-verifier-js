import CONTEXTS from './contexts';

const preloadedContexts = {};

/** ***** BLOCKCERTS ***** **/
/** V1 **/
preloadedContexts['https://w3id.org/blockcerts/v1'] = CONTEXTS.BLOCKCERTSV1_2;

/** ***** OPEN BADGES ***** **/
preloadedContexts['https://w3id.org/openbadges/v2'] = CONTEXTS.OPEN_BADGES;
preloadedContexts['https://openbadgespec.org/v2/context.json'] = CONTEXTS.OPEN_BADGES;

export default preloadedContexts;
