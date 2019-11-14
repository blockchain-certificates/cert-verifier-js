import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../../constants';
import { TransactionData, VerifierError } from '../../../models';
import { stripHashPrefix } from '../../utils/stripHashPrefix';
import { getText } from '../../../domain/i18n/useCases';

export function generateTransactionDataFromBlockchainInfoResponse (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockchainInfoResponse'));
  }
  const time = jsonResponse.time;
  const outputs = jsonResponse.out;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.inputs[0].prev_out.addr;
  const opReturnScript = stripHashPrefix(lastOutput.script, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.addr)
    .map(output => output.addr);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}
