import { CONTEXT_URLS } from '@blockcerts/schemas';
import { isString } from '../../helpers/string';
import type { JsonLDContext } from '../../models/Blockcerts';

export interface VCVersion {
  versionNumber: number;
}

export function isVCV2 (context: JsonLDContext | string): boolean {
  return retrieveVCVersion(context).versionNumber === 2;
}

export default function retrieveVCVersion (context: JsonLDContext | string): VCVersion {
  if (typeof context === 'string') {
    context = [context];
  }

  const VCContextsUrls = [CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V1_CONTEXT, CONTEXT_URLS.VERIFIABLE_CREDENTIAL_V2_CONTEXT];

  const VCContext: string = context.filter(isString).find((ctx: string) => VCContextsUrls.includes(ctx));

  let versionNumber: number = -1;

  if (VCContext?.includes('v1')) {
    versionNumber = 1;
  }

  if (VCContext?.includes('v2')) {
    versionNumber = 2;
  }

  return {
    versionNumber
  };
}
