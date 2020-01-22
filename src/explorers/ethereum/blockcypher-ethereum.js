import { dateToUnixTimestamp } from '../../helpers/date';
import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../constants';
import { TransactionData, VerifierError } from '../../models';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { getText } from '../../domain/i18n/useCases';
import { prependHashPrefix } from '../utils/prependHashPrefix';

export function generateTransactionDataFromBlockcypherEthereumResponse (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockCypherResponse'));
  }

  const time = dateToUnixTimestamp(jsonResponse.received);
  const outputs = jsonResponse.outputs;
  const lastOutput = outputs[outputs.length - 1];
  let issuingAddress = jsonResponse.inputs[0].addresses[0];
  const opReturnScript = stripHashPrefix(lastOutput.script, BLOCKCHAINS.ethmain.prefixes);
  issuingAddress = prependHashPrefix(issuingAddress, BLOCKCHAINS.ethmain.prefixes);
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
