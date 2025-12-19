export const isProd = import.meta.env.PROD;

export const logger = {
  debug: (...args: any[]) => {
    if (!isProd) console.debug('[client]', ...args);
  },
  info: (...args: any[]) => {
    if (!isProd) console.info('[client]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[client]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[client]', ...args);
  },
};
