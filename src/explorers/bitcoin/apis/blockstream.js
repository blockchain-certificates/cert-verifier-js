import { BLOCKCHAINS, SUB_STEPS } from '../../../constants';
import { TransactionData, VerifierError } from '../../../models';
import { getText } from '../../../domain/i18n/useCases';
import { stripHashPrefix } from '../../utils/stripHashPrefix';
import { timestampToDateObject } from '../../../helpers/date';

export function parseTransactionDataFromBlockstreamResponse (jsonResponse) {
  if (!jsonResponse.status.confirmed) {
    throw new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'parseBlockstreamResponse'));
  }
  const time = timestampToDateObject(jsonResponse.status.block_time);
  const outputs = jsonResponse.vout;
  const lastOutput = outputs[outputs.length - 1];
  const issuingAddress = jsonResponse.vout[0].scriptpubkey_address;
  const opReturnScript = stripHashPrefix(lastOutput.scriptpubkey, BLOCKCHAINS.bitcoin.prefixes);
  const revokedAddresses = outputs
    .filter(output => !!output.scriptpubkey_address)
    .map(output => output.scriptpubkey_address);
  return new TransactionData(
    opReturnScript,
    issuingAddress,
    time,
    revokedAddresses
  );
}
