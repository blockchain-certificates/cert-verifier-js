import { BLOCKCHAINS, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { timestampToDateObject } from '../../helpers/date';
import { TransactionData } from '../../models/TransactionData';
import { ExplorerAPI, ExplorerURLs } from '../../certificate';
import { TRANSACTION_APIS } from '../../constants/api';

function parsingFunction (jsonResponse): TransactionData {
  if (!jsonResponse.status.confirmed) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockstreamResponse'));
  }
  const time: Date = timestampToDateObject(jsonResponse.status.block_time);
  const outputs = jsonResponse.vout;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress: string = jsonResponse.vout[0].scriptpubkey_address;
  const remoteHash: string = stripHashPrefix(lastOutput.scriptpubkey, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses: string[] = outputs
    .filter(output => !!output.scriptpubkey_address)
    .map(output => output.scriptpubkey_address);
  return {
    remoteHash,
    issuingAddress,
    time,
    revokedAddresses
  };
}

const serviceURL: ExplorerURLs = {
  main: `https://blockstream.info/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
  test: `https://blockstream.info/testnet/api/tx/${TRANSACTION_ID_PLACEHOLDER}`
};

export const explorerApi: ExplorerAPI = {
  serviceURL,
  serviceName: TRANSACTION_APIS.blockstream,
  parsingFunction,
  priority: -1
};
