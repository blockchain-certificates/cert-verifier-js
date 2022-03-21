import type { IDidDocument, IServiceEndpoint } from '../../../models/DidDocument';

export default function getIssuerProfileUrl (didDocument: IDidDocument): string {
  if (!didDocument.service) {
    return '';
  }

  const issuerProfileService: IServiceEndpoint = didDocument.service.find(endpoint => endpoint.type === 'IssuerProfile');
  const issuerProfileUrl: string = issuerProfileService?.serviceEndpoint;
  return issuerProfileUrl ?? '';
}
