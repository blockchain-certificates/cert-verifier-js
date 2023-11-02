import { versionParserMap } from '../index';
import type { JsonLDContext } from '../../models/Blockcerts';
import { isString } from '../../helpers/string';
import Versions from '../../constants/certificateVersions';

function lookupVersion (array: string[], v: string): boolean {
  return array.some(str => str.includes(`v${v}`) || str.includes(`${v}.`));
}

function filterBlockcertsContext (contextList: string[]): string {
  return contextList.find((ctx: string) => ctx.toLowerCase().indexOf('blockcerts') > 0);
}

function filterStringContexts (context: JsonLDContext): string[] {
  return context.filter(isString);
}

export interface BlockcertsVersion {
  versionNumber: number;
  version: Versions;
}

export function retrieveBlockcertsVersion (context: JsonLDContext | string): BlockcertsVersion {
  if (typeof context === 'string') {
    context = [context];
  }

  const blockcertsContext: string = filterBlockcertsContext(filterStringContexts(context));
  if (!blockcertsContext) {
    // TODO: with that we are introducing verification support for certs that are not exactly Blockcerts documents
    // TODO: i.e.: revocation list in Revocation Status List 2021, essentially allowing verification of documents
    // TODO: signed with supported verification suites. We need to improve what's being returned here and verify the
    // TODO: vc compliance as well as return proper content
    return {
      version: Versions.V3_0,
      versionNumber: 3
    };
  }
  const blockcertsContextArray: string[] = blockcertsContext.split('/').filter(str => str !== '');

  const availableVersions: string[] = Object.keys(versionParserMap);
  const versionNumber = parseInt(availableVersions.filter(version => lookupVersion(blockcertsContextArray, version.toString()))[0], 10);

  let version: Versions;
  switch (versionNumber) {
    case 1:
      version = Versions.V1_2;
      break;
    case 2:
      version = Versions.V2_0;
      break;
    case 3:
      if (blockcertsContext.includes('-alpha')) {
        version = Versions.V3_0_alpha;
        break;
      }
      if (blockcertsContext.includes('-beta')) {
        version = Versions.V3_0_beta;
        break;
      }
      version = Versions.V3_0;
      break;
  }

  return {
    versionNumber,
    version
  };
}
