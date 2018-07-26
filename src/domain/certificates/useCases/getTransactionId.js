import { VerifierError } from '../../../models';

export default function getTransactionId (certificateReceipt) {
  try {
    return certificateReceipt.anchors[0].sourceId;
  } catch (e) {
    throw new VerifierError(
      '',
      'Cannot verify this certificate without a transaction ID to compare against.'
    );
  }
}
