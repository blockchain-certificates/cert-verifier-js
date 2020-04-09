import { BLOCKCHAINS, CONFIG, SUB_STEPS } from '../../constants';
import { TransactionData, VerifierError } from '../../models';
import { getText } from '../../domain/i18n/useCases';
import { stripHashPrefix } from '../utils/stripHashPrefix';
import { timestampToDateObject } from '../../helpers/date';

export function parseTransactionDataFromBlockexplorerResponse (jsonResponse) {
  if (jsonResponse.confirmations < CONFIG.MininumConfirmations) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockexplorerResponse'));
  }
  const time = timestampToDateObject(jsonResponse.blocktime);
  const outputs = jsonResponse.vout;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.vout[0].scriptPubKey.addresses[0];
  const opReturnScript = stripHashPrefix(lastOutput.scriptPubKey.hex, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.spentTxId)
    .map(output => output.scriptPubKey.addresses[0]);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}
