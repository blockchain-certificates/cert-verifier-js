const formatValidation = 'formatValidation';
const hashComparison = 'hashComparison';
const statusCheck = 'statusCheck';
const final = 'final';

const language = {
  [formatValidation]: {
    label: 'Format validation',
    labelPending: 'Validating format',
    subSteps: []
  },
  [hashComparison]: {
    label: 'Hash comparison',
    labelPending: 'Comparing hash',
    subSteps: []
  },
  [statusCheck]: {
    label: 'Status check',
    labelPending: 'Checking record status',
    subSteps: []
  }
};

export { final, formatValidation, hashComparison, statusCheck, language };
