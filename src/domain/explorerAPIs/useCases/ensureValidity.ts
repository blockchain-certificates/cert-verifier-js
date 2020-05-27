import { ExplorerAPI } from '../../../certificate';

function isPriorityValid (explorerAPI: ExplorerAPI): boolean {
  return explorerAPI.priority >= 0;
}

function isParsingFunctionValid (explorerAPI: ExplorerAPI): boolean {
  return typeof explorerAPI.parsingFunction === 'function';
}

export default function ensureValidity (explorerAPIs: ExplorerAPI[] = []): boolean {
  if (explorerAPIs.length === 0) {
    return false;
  }

  if (explorerAPIs.some(explorerAPI => !isPriorityValid(explorerAPI))) {
    throw new Error('One or more of your custom explorer APIs has a priority set below zero');
  }

  if (explorerAPIs.some(explorerAPI => !isParsingFunctionValid(explorerAPI))) {
    throw new Error('One or more of your custom explorer APIs does not have a parsing function');
  }

  return true;
}
