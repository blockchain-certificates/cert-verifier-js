import { dateToUnixTimestamp } from '../../helpers/date';
import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { generateTransactionData, VerifierError } from '../../models';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';
import { TransactionData } from '../../models/TransactionData';
import { ExplorerURLs } from '../../certificate';

function parsingTransactionDataFunction (jsonResponse): TransactionData {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockCypherResponse'));
  }
  const time: Date = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress: string = jsonResponse.inputs[0].addresses[0];
  const opReturnScript: string = stripHashPrefix(lastOutput.script, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses: string[] = outputs
    .filter(output => !!output.spent_by)
    .map(output => output.addresses[0]);
  return generateTransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}

const serviceUrls: ExplorerURLs = {
  main: `https://api.blockcypher.com/v1/btc/main/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`,
  test: `https://api.blockcypher.com/v1/btc/test3/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`
};

export {
  serviceUrls,
  parsingTransactionDataFunction
};
