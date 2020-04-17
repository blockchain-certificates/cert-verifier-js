export type TransactionData = {
  remoteHash: string;
  issuingAddress: string;
  time: string | Date;
  revokedAddresses: string[];
}

export default function generateTransactionData (
  remoteHash: string,
  issuingAddress: string,
  time: string | Date,
  revokedAddresses: string[]): TransactionData {
  return {
    remoteHash,
    issuingAddress,
    time,
    revokedAddresses
  }
}
