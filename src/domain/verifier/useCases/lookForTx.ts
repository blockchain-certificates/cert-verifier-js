import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../../constants';
import { VerifierError } from '../../../models';
import PromiseProperRace from '../../../helpers/promiseProperRace';
import { getText } from '../../i18n/useCases';
import { TransactionData } from '../../../models/TransactionData';
import { default as Versions, isV1 } from '../../../constants/certificateVersions';
import { SupportedChains } from '../../../constants/blockchains';
import { TExplorerFunctionsArray } from '../../../explorers/explorer';
import { TExplorerAPIs } from '../../../verifier';

export function getExplorersByChain (chain: SupportedChains, certificateVersion: Versions, explorerAPIs: TExplorerAPIs): TExplorerFunctionsArray {
  if (isV1(certificateVersion)) {
    return explorerAPIs.v1;
  }

  switch (chain) {
    case BLOCKCHAINS[SupportedChains.Bitcoin].code:
    case BLOCKCHAINS[SupportedChains.Regtest].code:
    case BLOCKCHAINS[SupportedChains.Testnet].code:
    case BLOCKCHAINS[SupportedChains.Mocknet].code:
      return explorerAPIs.bitcoin;
    case BLOCKCHAINS[SupportedChains.Ethmain].code:
    case BLOCKCHAINS[SupportedChains.Ethropst].code:
    case BLOCKCHAINS[SupportedChains.Ethrinkeby].code:
      return explorerAPIs.ethereum;

  }

  throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxInvalidChain'));
}

export default function lookForTx (
  { transactionId, chain, certificateVersion, explorerAPIs }:
  { transactionId: string, chain: SupportedChains, certificateVersion: Versions, explorerAPIs: TExplorerAPIs }
): Promise<TransactionData> {
  let BlockchainExplorers: TExplorerFunctionsArray;
  if (explorerAPIs.custom?.length) {
    BlockchainExplorers = explorerAPIs.custom;
  } else {
    BlockchainExplorers = getExplorersByChain(chain, certificateVersion, explorerAPIs);
  }

  if (CONFIG.MinimumBlockchainExplorers < 0 || CONFIG.MinimumBlockchainExplorers > BlockchainExplorers.length) {
    return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxInvalidAppConfig')));
  }

  const promises: any[] = [];
  let limit: number = CONFIG.Race ? BlockchainExplorers.length : CONFIG.MinimumBlockchainExplorers;
  for (let i = 0; i < limit; i++) {
    promises.push(BlockchainExplorers[i](transactionId, chain));
  }

  return new Promise((resolve, reject): TransactionData => {
    return PromiseProperRace(promises, CONFIG.MinimumBlockchainExplorers).then(winners => {
      if (!winners || winners.length === 0) {
        return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxCouldNotConfirm')));
      }

      // Compare results returned by different blockchain apis. We pick off the first result and compare the others
      // returned. The number of winners corresponds to the configuration setting `MinimumBlockchainExplorers`.
      // We require that all results agree on `issuingAddress` and `remoteHash`. Not all blockchain apis return
      // spent outputs (revoked addresses for <=v1.2), and we do not have enough coverage to compare this, but we do
      // ensure that a TxData with revoked addresses is returned, for the rare case of legacy 1.2 certificates.
      //
      // Note that APIs returning results where the number of confirmations is less than `MininumConfirmations` are
      // filtered out, but if there are at least `MinimumBlockchainExplorers` reporting that the number of confirmations
      // are above the `MininumConfirmations` threshold, then we can proceed with verification.
      const firstResponse = winners[0];
      for (let i = 1; i < winners.length; i++) {
        const thisResponse = winners[i];
        if (firstResponse.issuingAddress !== thisResponse.issuingAddress) {
          throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxDifferentAddresses'));
        }
        if (firstResponse.remoteHash !== thisResponse.remoteHash) {
          throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxDifferentRemoteHashes'));
        }
      }
      resolve(firstResponse);
    }).catch(err => {
      reject(new VerifierError(SUB_STEPS.fetchRemoteHash, err.message));
    });
  });
}
