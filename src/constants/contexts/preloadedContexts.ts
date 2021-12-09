import CONTEXTS from './contexts-list';

const preloadedContexts = {};

/** ***** BLOCKCERTS ***** **/

/** V2 **/
// alpha
preloadedContexts['https://w3id.org/blockcerts/schema/2.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV2_ALPHA;
preloadedContexts['https://www.blockcerts.org/schema/2.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV2_ALPHA;

// v2
preloadedContexts['https://w3id.org/blockcerts/v2'] = CONTEXTS.BLOCKCERTSV2;
preloadedContexts['https://www.w3id.org/blockcerts/schema/2.0/context.json'] = CONTEXTS.BLOCKCERTSV2;

// /** V3 **/
// alpha
preloadedContexts['https://www.blockcerts.org/schema/3.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV3_ALPHA;
preloadedContexts['https://w3id.org/blockcerts/schema/3.0-alpha/context.json'] = CONTEXTS.BLOCKCERTSV3_ALPHA;
preloadedContexts['https://w3id.org/blockcerts/v3.0-alpha'] = CONTEXTS.BLOCKCERTSV3_ALPHA;
// beta
preloadedContexts['https://www.blockcerts.org/schema/3.0-beta/context.json'] = CONTEXTS.BLOCKCERTSV3_BETA;
preloadedContexts['https://w3id.org/blockcerts/schema/3.0-beta/context.json'] = CONTEXTS.BLOCKCERTSV3_BETA;
preloadedContexts['https://w3id.org/blockcerts/v3.0-beta'] = CONTEXTS.BLOCKCERTSV3_BETA;
// v3
preloadedContexts['https://www.blockcerts.org/schema/3.0/context.json'] = CONTEXTS.BLOCKCERTSV3_BETA;
preloadedContexts['https://w3id.org/blockcerts/schema/3.0/context.json'] = CONTEXTS.BLOCKCERTSV3_BETA;
preloadedContexts['https://w3id.org/blockcerts/v3'] = CONTEXTS.BLOCKCERTSV3;

// extra definitions
preloadedContexts['https://w3id.org/blockcerts/schema/3.0-alpha/merkleProof2019Context.json'] = CONTEXTS.MERKLE_PROOF_2019;
preloadedContexts['https://www.blockcerts.org/schema/3.0-alpha/merkleProof2019Context.json'] = CONTEXTS.MERKLE_PROOF_2019;
preloadedContexts['https://w3id.org/blockcerts/3.0-alpha/merkleProof2019Context.json'] = CONTEXTS.MERKLE_PROOF_2019;

/** ***** OPEN BADGES ***** **/
preloadedContexts['https://w3id.org/openbadges/v2'] = CONTEXTS.OPEN_BADGES;
preloadedContexts['https://openbadgespec.org/v2/context.json'] = CONTEXTS.OPEN_BADGES;

// /** ***** VERIFIABLE CREDENTIALS ***** **/
preloadedContexts['https://www.w3.org/2018/credentials/v1'] = CONTEXTS.VERIFIABLE_CREDENTIALS;
preloadedContexts['https://www.w3.org/2018/credentials/examples/v1'] = CONTEXTS.VERIFIABLE_CREDENTIALS_EXAMPLE;
// this one is inherited from the credential/examples one
preloadedContexts['https://www.w3.org/ns/odrl.jsonld'] = CONTEXTS.ODRL;

export default preloadedContexts;
