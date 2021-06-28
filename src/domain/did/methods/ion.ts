import ION from '@decentralized-identity/ion-tools';
import { IDidDocument } from '../../../models/DidDocument';

const ionApiServer = 'http://127.0.0.1:3000';

export default async function ion (did): Promise<IDidDocument> {
  const didDocument = await ION.resolve(did, { nodeEndpoint: `${ionApiServer}/identifiers/` });
  // console.log(JSON.stringify(didDocument, null, 2));
  return didDocument;
}
