export function safelyAppendUrlParameter (url: string, parameterKey: string, parameterValue: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${parameterKey}=${parameterValue}`;
}

export function isValidUrl (url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return !parsedUrl.pathname.includes(' ') && !parsedUrl.hostname.includes(' ') && url.includes(':');
  } catch {
    return false;
  }
}
