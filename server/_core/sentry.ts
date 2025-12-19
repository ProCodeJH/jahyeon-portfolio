import * as Sentry from '@sentry/node';

export function initSentry() {
  try {
    const dsn = process.env.SENTRY_DSN;
    if (!dsn) return;
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      release: process.env.COMMIT_SHA || undefined,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Sentry init failed (server)', e);
  }
}

export const captureException = (err: unknown, ctx?: Record<string, unknown>) => {
  try {
    Sentry.captureException(err as Error, { extra: ctx });
  } catch (e) {
    // ignore
  }
};
