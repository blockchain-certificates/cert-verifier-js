import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../../constants';
import { TransactionData, VerifierError } from '../../../models';
import { stripHashPrefix } from '../../utils/stripHashPrefix';
import { getText } from '../../../domain/i18n/useCases';

export function generateTransactionDataFromBitcoinchainResponse (jsonResponse) {
  const transaction = jsonResponse['0'];
  if (transaction.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBitcoinchainResponse'));
  }
  const time = transaction.block_time;
  const outputs = transaction.outputs;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = transaction.inputs[0].sender;
  const opReturnScript = stripHashPrefix(lastOutput.out_script.hex, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.spending_input.tx)
    .map(output => output.receiver);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}
