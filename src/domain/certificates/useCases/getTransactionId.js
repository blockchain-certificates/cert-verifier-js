import { VerifierError } from '../../../models';
import { getText } from '../../i18n/useCases';

export default function getTransactionId (certificateReceipt) {
  try {
    return certificateReceipt.anchors[0].sourceId;
  } catch (e) {
    throw new VerifierError('', getText('errors', 'getTransactionId'));
  }
}
