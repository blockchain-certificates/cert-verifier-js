import { VerifierError } from '../../../models/verifierError';

export default function getTransactionId (certificateReceipt) {
  try {
    return certificateReceipt.anchors[0].sourceId;
  } catch (e) {
    throw new VerifierError(
      'Can\'t verify this certificate without a transaction ID to compare against.'
    );
  }
}
