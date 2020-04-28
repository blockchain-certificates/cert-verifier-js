export interface TransactionData {
  remoteHash: string;
  issuingAddress: string;
  time: string | Date;
  revokedAddresses: string[];
}
