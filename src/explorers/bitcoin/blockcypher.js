import { dateToUnixTimestamp } from '../../helpers/date';
import { BLOCKCHAINS, CONFIG, SUB_STEPS, TRANSACTION_ID_PLACEHOLDER } from '../../constants';
import { TransactionData, VerifierError } from '../../models';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';

function parsingTransactionDataFunction (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockCypherResponse'));
  }
  const time = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = stripHashPrefix(lastOutput.script, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.spent_by)
    .map(output => output.addresses[0]);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}

const serviceUrls = {
  main: `https://api.blockcypher.com/v1/btc/main/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`,
  test: `https://api.blockcypher.com/v1/btc/test3/txs/${TRANSACTION_ID_PLACEHOLDER}?limit=500`
};

export {
  serviceUrls,
  parsingTransactionDataFunction
};
