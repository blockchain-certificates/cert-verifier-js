import { versionParserMap } from './parsers';

function lookupVersion (array, v) {
  return array.some(str => str.indexOf(`v${v}`) > -1 || str.indexOf(`${v}.`) > -1);
}

/**
 *
 * @param context: string | Context[]
 * @returns {string}
 */
function retrieveBlockcertsVersion (context) {
  if (typeof context === 'string') {
    context = [context];
  }

  const blockcertsContext = context.filter(ctx => typeof ctx === 'string').find(ctx => ctx.toLowerCase().indexOf('blockcerts') > 0);
  const blockcertsContextArray = blockcertsContext.split('/').filter(str => str !== '');

  const availableVersions = Object.keys(versionParserMap);

  return availableVersions.filter(version => lookupVersion(blockcertsContextArray, version))[0];
}

/**
 * parseJson
 *
 * @param certificateJson
 * @returns {*}
 */
export default async function parseJSON (certificateJson) {
  try {
    const version = retrieveBlockcertsVersion(certificateJson['@context']);
    const parsedCertificate = await versionParserMap[version](certificateJson);
    parsedCertificate.isFormatValid = true;
    return parsedCertificate;
  } catch (error) {
    return {
      isFormatValid: false,
      error
    };
  }
}
