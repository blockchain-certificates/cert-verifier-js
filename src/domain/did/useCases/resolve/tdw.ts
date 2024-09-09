import { getLatestDIDDoc } from 'trustdidweb-ts/src/routes/did';

export async function resolveDidTdw (did: string): Promise<{ doc: any; meta: any }> {
  return await getLatestDIDDoc({
    params: { id: did },
    set: null
  });
}
