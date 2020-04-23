import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import debug from 'debug';
import { getText } from '../domain/i18n/useCases';

const log = debug('blockchainConnectors');

export default function PromiseProperRace (promises, count, results = []) {
  // Source: https://blog.jcore.com/2016/12/18/promise-me-you-wont-use-promise-race/
  promises = Array.from(promises);

  if (promises.length < count) {
    return Promise.reject(new VerifierError(SUB_STEPS.fetchRemoteHash, getText('errors', 'couldNotConfirmTx')));
  }

  const indexPromises = promises.map((p, index) => p.then(() => index).catch((err) => {
    log(err);
    throw index;
  }));

  return Promise.race(indexPromises).then(index => {
    const p = promises.splice(index, 1)[0];
    p.then(e => results.push(e));

    if (count === 1) {
      return results;
    }
    return PromiseProperRace(promises, count - 1, results);
  }).catch(index => {
    promises.splice(index, 1);
    return PromiseProperRace(promises, count, results);
  });
}
