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
async function runPromiseRace (promises): Promise<TransactionData> {
  let winners;
  try {
    winners = await PromiseProperRace(promises, CONFIG.MinimumBlockchainExplorers);
  } catch (err) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, err.message);
  }

  if (!winners || winners.length === 0) {
    // eslint-disable-next-line @typescript-eslint/return-await
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxCouldNotConfirm'));
  }

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
  return firstResponse;
}

type PromiseRaceQueue = TExplorerFunctionsArray[];

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
  { defaultAPIs, customAPIs }: { defaultAPIs: TExplorerFunctionsArray; customAPIs: TExplorerFunctionsArray }): PromiseRaceQueue {
  const promiseRaceQueue = [defaultAPIs];

  if (customAPIs?.length) {
    const priority: number = customAPIs[0].priority;
    promiseRaceQueue.splice(priority, 0, customAPIs);
  }

  const apisCount: number = defaultAPIs.concat(customAPIs).length;
  if (CONFIG.MinimumBlockchainExplorers < 0 || CONFIG.MinimumBlockchainExplorers > apisCount) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'lookForTxInvalidAppConfig'));
  }

  return promiseRaceQueue;
}

async function runQueueByIndex (queues, index: number, transactionId, chain): Promise<TransactionData> {
  try {
    const race = buildQueuePromises(queues[index], transactionId, chain);
    return await runPromiseRace(race);
  } catch (err) {
    if (index < queues.length - 1) {
      index++;
      return await runQueueByIndex(queues, index, transactionId, chain);
    }
    throw err;
  }
}

export default async function lookForTx (
  { transactionId, chain, certificateVersion, explorerAPIs }:
  { transactionId: string; chain: SupportedChains; certificateVersion: Versions; explorerAPIs: TExplorerAPIs }
): Promise<TransactionData> {
  // Build explorers queue ordered by priority
  const lookupQueues = buildPromiseRacesQueue({
    defaultAPIs: getExplorersByChain(chain, certificateVersion, explorerAPIs),
    customAPIs: explorerAPIs.custom
  });

  // Run queue
  const currentQueueProcessedIndex = 0;
  return await runQueueByIndex(lookupQueues, currentQueueProcessedIndex, transactionId, chain);
}
