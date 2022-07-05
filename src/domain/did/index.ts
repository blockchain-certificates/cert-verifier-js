import * as did from './useCases/index.js';
import didResolver from './valueObjects/didResolver.js';

export default {
  ...did,
  didResolver
};
