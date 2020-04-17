import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { generateTransactionData, VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { timestampToDateObject } from '../../helpers/date';
import { TransactionData } from '../../models/TransactionData';
import { ExplorerURLs } from '../../certificate';

function parsingTransactionDataFunction (jsonResponse): TransactionData {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockexplorerResponse'));
  }
  const time: Date = timestampToDateObject(jsonResponse.blocktime);
  const outputs = jsonResponse.vout;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress: string = jsonResponse.vout[0].scriptPubKey.addresses[0];
  const opReturnScript: string = stripHashPrefix(lastOutput.scriptPubKey.hex, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses: string[] = outputs
    .filter(output => !!output.spentTxId)
    .map(output => output.scriptPubKey.addresses[0]);
  return generateTransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}

const serviceUrls: ExplorerURLs = {
  main: `https://blockexplorer.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`,
  test: `https://testnet.blockexplorer.com/api/tx/${TRANSACTION_ID_PLACEHOLDER}`
};

export {
  serviceUrls,
  parsingTransactionDataFunction
};
