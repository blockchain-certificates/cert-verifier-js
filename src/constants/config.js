export const SecurityContextUrl = 'https://w3id.org/security/v1';

// Minimum number of confirmations to consider a transaction valid. Recommended setting = 10
export const MininumConfirmations = 1;

// Minimum number of blockchain APIs to consult to compare transaction data consistency
export const MinimumBlockchainExplorers = 1;

// Try all blockchain explorers (even > MinimumBlockchainExplorers) to increase the chance of a successful query.
export const Race = false;

export const CheckForUnmappedFields = true;

export const PublicKey = 'ecdsa-koblitz-pubkey:1';
