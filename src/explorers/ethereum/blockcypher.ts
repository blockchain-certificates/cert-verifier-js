import { ExplorerAPI } from '../../certificate';
import { ExplorerURLs } from '../../index';
import { TRANSACTION_APIS, TRANSACTION_ID_PLACEHOLDER } from '../../constants/api';
import { TransactionData } from '../../models/TransactionData';
import { dateToUnixTimestamp } from '../../helpers/date';
import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../constants';
import { VerifierError } from '../../models';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';
import { prependHashPrefix } from '../utils/prependHashPrefix';

const serviceURL: ExplorerURLs = {
  main: `https://api.blockcypher.com/v1/eth/main/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`,
  test: `https://api.blockcypher.com/v1/beth/test/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`
};

function parsingFunction (jsonResponse): TransactionData {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockCypherResponse'));
  }

  const time = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  const lastOutput = outputs[outputs.length - 1];
  let issuingAddress: string = jsonResponse.inputs[0].addresses[0];
  const remoteHash = stripHashPrefix(lastOutput.script, BLOCKCHAINS.ethmain.prefixes);
  issuingAddress = prependHashPrefix(issuingAddress, BLOCKCHAINS.ethmain.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.spent_by)
    .map(output => output.addresses[0]);
  return {
    remoteHash,
    issuingAddress,
    time,
    revokedAddresses
  };
}

export const explorerApi: ExplorerAPI = {
  serviceURL,
  serviceName: TRANSACTION_APIS.blockcypher,
  parsingFunction,
  priority: -1
};
