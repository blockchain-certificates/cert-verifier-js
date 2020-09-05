export function safelyAppendUrlParameter (url: string, parameterKey: string, parameterValue: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${parameterKey}=${parameterValue}`;
}
