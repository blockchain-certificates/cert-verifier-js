import type { HashlinkVerifier, HashlinkModel } from '@blockcerts/hashlink-verifier';

function replaceHashlinksWithUrls (display: string, urls: string[], hashlinks: string[]): string {
  urls.forEach((url, i) => {
    display = display.replace(hashlinks[i], url);
  });
  return display;
}

async function decodeHashlinks (hashlinks: string[], hl: HashlinkVerifier): Promise<string[]> {
  const decoded: HashlinkModel[] = await Promise.all(
    hashlinks.map(async (hashlink): Promise<HashlinkModel> => {
      const decoded = await hl.decode(hashlink);
      return decoded;
    }));
  return decoded.reduce(function (urls, decodedHashlink: HashlinkModel) {
    urls.push(decodedHashlink.meta.url[0]);
    return urls;
  }, []);
}

export default async function convertHashlink (display: string, hl: HashlinkVerifier): Promise<string> {
  const hashlinkTest = /hl:{1}[a-zA-Z0-9]+:{1}[a-zA-Z0-9]+/gm;
  const hashlinksMatch = [...display.matchAll(hashlinkTest)];
  const hashlinks = hashlinksMatch.map(match => match[0]).filter(value => !!value);

  if (hashlinks.length) {
    const urls: string[] = await decodeHashlinks(hashlinks, hl);
    display = replaceHashlinksWithUrls(display, urls, hashlinks);
  }
  return display;
}
