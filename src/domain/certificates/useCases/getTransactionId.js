import { VerifierError } from '../../../models';
import { getText } from '../../i18n/useCases';

export default function getTransactionId (certificateReceipt = {}) {
  try {
    const { anchors } = certificateReceipt;
    const anchor = anchors[0];
    if (anchor.sourceId) {
      return anchor.sourceId;
    }

    if (typeof anchor === 'string') {
      const dataArray = anchor.split(':');
      return dataArray.pop();
    }
  } catch (err) {
    throw new VerifierError('', getText('errors', 'getTransactionId'));
  }
}
