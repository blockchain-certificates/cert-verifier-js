import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../../constants';
import { VerifierError } from '../../../models';
import PromiseProperRace from '../../../helpers/promiseProperRace';
import { getText } from '../../i18n/useCases';
import { TransactionData } from '../../../models/TransactionData';
import Versions, { isV1 } from '../../../constants/certificateVersions';
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

// eslint-disable-next-line @typescript-eslint/promise-function-async
function runPromiseRace (promises): Promise<TransactionData> {
  // eslint-disable-next-line @typescript-eslint/return-await
  return new Promise((resolve, reject): TransactionData => {
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    return PromiseProperRace(promises, CONFIG.MinimumBlockchainExplorers).then(winners => {
      if (!winners || winners.length === 0) {
        // eslint-disable-next-line @typescript-eslint/return-await
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

type PromiseRaceQueue = any[][];

function buildQueuePromises (queue, transactionId, chain): any[] {
  if (CONFIG.MinimumBlockchainExplorers < 0 || CONFIG.MinimumBlockchainExplorers > queue.length) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxInvalidAppConfig'));
  }

  const promises: any[] = [];
  const limit: number = CONFIG.Race ? queue.length : CONFIG.MinimumBlockchainExplorers;
  for (let i = 0; i < limit; i++) {
    promises.push(queue[i].parsingFunction(transactionId, chain));
  }

  return promises;
}

function buildPromiseRacesQueue (
  { defaultAPIs, customAPIs, transactionId, chain }: { defaultAPIs: TExplorerFunctionsArray; customAPIs: TExplorerFunctionsArray; transactionId; chain }): PromiseRaceQueue {
  const promiseRaceQueue = [defaultAPIs];

  if (customAPIs?.length) {
    const priority: number = customAPIs[0].priority;
    promiseRaceQueue.splice(priority, 0, customAPIs);
  }

  const apisCount: number = defaultAPIs.concat(customAPIs).length;
  if (CONFIG.MinimumBlockchainExplorers < 0 || CONFIG.MinimumBlockchainExplorers > apisCount) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxInvalidAppConfig'));
  }

  return promiseRaceQueue.map(queue => buildQueuePromises(queue, transactionId, chain));
}

async function runRaceByIndex (races, raceIndex: number): Promise<TransactionData> {
  try {
    return await runPromiseRace(races[raceIndex]);
  } catch (err) {
    if (raceIndex < races.length - 1) {
      return await runRaceByIndex(races, raceIndex++);
    }
    throw err;
  }
}

export default async function lookForTx (
  { transactionId, chain, certificateVersion, explorerAPIs }:
  { transactionId: string; chain: SupportedChains; certificateVersion: Versions; explorerAPIs: TExplorerAPIs }
): Promise<TransactionData> {
  // Build explorers queue ordered by priority
  const racesQueue = buildPromiseRacesQueue({
    defaultAPIs: getExplorersByChain(chain, certificateVersion, explorerAPIs),
    customAPIs: explorerAPIs.custom,
    transactionId,
    chain
  });

  // Run queue
  const currentQueueProcessedIndex = 0;
  return await runRaceByIndex(racesQueue, currentQueueProcessedIndex);
}
