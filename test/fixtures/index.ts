import BlockcertsV3Beta from './v3/blockcerts-3.0-beta.json';
import BlockcertsV3Alpha from './v3/blockcerts-3.0-alpha.json';
import BlockcertsV3AlphaCustomContext from './v3/blockcerts-3.0-alpha-learningmachine.json';
import BlockcertsV3AlphaTampered from './v3/blockcerts-3.0-alpha--tampered.json';
import BlockcertsV3AlphaNoIssuerProfile from './v3/blockcerts-3.0-alpha--no-issuer-profile.json';
import EthereumMainV2Valid from './v2/ethereum-main-valid-2.0.json';
import EthereumMainInvalidMerkleRoot from './v2/ethereum-merkle-root-unmatch-2.0.json';
import EthereumMainRevoked from './v2/ethereum-revoked-2.0.json';
import EthereumRopstenRevokedNoRevocationList from './v2/ethereum-ropsten-revoked-no-revocationlist-2.0.json';
import EthereumRopstenV2Valid from './v2/ethereum-ropsten-valid-2.0.json';
import EthereumTampered from './v2/ethereum-tampered-2.0.json';
import MainnetInvalidMerkleReceipt from './v2/mainnet-invalid-merkle-receipt-2.0.json';
import MainnetMerkleRootUmmatch from './v2/mainnet-merkle-root-unmatch-2.0.json';
import MainnetV2Revoked from './v2/mainnet-revoked-2.0.json';
import MainnetV2Valid from './v2/mainnet-valid-2.0.json';
import MainnetV2AlphaValid from './v2/mainnet-valid-2.0-alpha.json';
import MocknetV2Valid from './v2/mocknet-valid-2.0.json';
import RegtestV2Valid from './v2/regtest-valid-2.0.json';
import TestnetRevokedV2 from './v2/testnet-revoked-key-2.0.json';
import TestnetTamperedHashes from './v2/testnet-tampered-hashes-2.0.json';
import TestnetV1Valid from './v1/testnet-valid-1.2.json';
import TestnetV2Valid from './v2/testnet-valid-2.0.json';
import TestnetV2ValidV1Issuer from './v2/testnet-valid-v1-issuer-2.0.json';

export default {
  BlockcertsV3Beta,
  BlockcertsV3Alpha,
  BlockcertsV3AlphaCustomContext,
  BlockcertsV3AlphaTampered,
  BlockcertsV3AlphaNoIssuerProfile,
  EthereumMainV2Valid,
  EthereumMainInvalidMerkleRoot,
  EthereumMainRevoked,
  EthereumRopstenRevokedNoRevocationList,
  EthereumRopstenV2Valid,
  EthereumTampered,
  MainnetInvalidMerkleReceipt,
  MainnetMerkleRootUmmatch,
  MainnetV2Revoked,
  MainnetV2Valid,
  MainnetV2AlphaValid,
  MocknetV2Valid,
  RegtestV2Valid,
  TestnetRevokedV2,
  TestnetTamperedHashes,
  TestnetV1Valid,
  TestnetV2Valid,
  TestnetV2ValidV1Issuer
};
