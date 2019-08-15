const SecurityContextUrl = 'https://w3id.org/security/v1';

// Minimum number of confirmations to consider a transaction valid. Recommended setting = 10
const MininumConfirmations = 1;

// Minimum number of blockchain APIs to consult to compare transaction data consistency
const MinimumBlockchainExplorers = 1;

// Try all blockchain explorers (even > MinimumBlockchainExplorers) to increase the chance of a successful query.
const Race = true;

const CheckForUnmappedFields = true;

const PublicKey = 'ecdsa-koblitz-pubkey:1';

export default {
  SecurityContextUrl,
  MininumConfirmations,
  MinimumBlockchainExplorers,
  Race,
  CheckForUnmappedFields,
  PublicKey
};
