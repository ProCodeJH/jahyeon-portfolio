const DEFAULT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = {
  debug: (...args: any[]) => {
    if (DEFAULT_LEVEL === 'debug') console.debug('[server]', ...args);
  },
  info: (...args: any[]) => {
    if (DEFAULT_LEVEL === 'debug' || DEFAULT_LEVEL === 'info') console.info('[server]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[server]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[server]', ...args);
  },
};
