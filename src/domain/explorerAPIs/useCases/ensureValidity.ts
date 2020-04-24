import { ExplorerAPI } from '../../../certificate';

function isPriorityValid (explorerAPI: ExplorerAPI): boolean {
  return explorerAPI.priority >= 0;
}

function isParsingFunctionValid (explorerAPI: ExplorerAPI): boolean {
  return typeof explorerAPI.parsingFunction === 'function';
}

export default function ensureValidity (explorerAPIs: ExplorerAPI[]) {
  const explorersPriorityBelowZero: ExplorerAPI[] =
    explorerAPIs.filter(explorerAPI => !isPriorityValid(explorerAPI));
  if (explorersPriorityBelowZero.length > 0) {
    throw new Error('One or more of your custom explorer APIs has a priority set below zero');
  }

  const explorersMissingParsingFunction: ExplorerAPI[] =
    explorerAPIs.filter(explorerAPI => !isParsingFunctionValid(explorerAPI));
  if (explorersMissingParsingFunction.length > 0) {
    throw new Error('One or more of your custom explorer APIs does not have a parsing function');
  }

  return true;
}
