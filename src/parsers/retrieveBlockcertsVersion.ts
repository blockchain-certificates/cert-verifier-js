import { versionParserMap } from './index';
import { JsonLDContext } from '../models/Blockcerts';
import { isString } from '../helpers/string';

function lookupVersion (array: string[], v: string): boolean {
  return array.some(str => str.includes(`v${v}`) || str.includes(`${v}.`));
}

function filterBlockcertsContext (contextList: string[]): string {
  return contextList.find((ctx: string) => ctx.toLowerCase().indexOf('blockcerts') > 0);
}

function filterStringContexts (context: JsonLDContext): string[] {
  return context.filter(isString);
}

export function retrieveBlockcertsVersion (context: JsonLDContext | string): number {
  if (typeof context === 'string') {
    context = [context];
  }

  const blockcertsContext: string = filterBlockcertsContext(filterStringContexts(context));
  const blockcertsContextArray: string[] = blockcertsContext.split('/').filter(str => str !== '');

  const availableVersions: string[] = Object.keys(versionParserMap);

  return parseInt(availableVersions.filter(version => lookupVersion(blockcertsContextArray, version.toString()))[0], 10);
}
