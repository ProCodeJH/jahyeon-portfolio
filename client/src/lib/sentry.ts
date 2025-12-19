export function initSentry() {
  try {
    const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
    if (!dsn) return;
    // lazy import to avoid bundling in dev when not needed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/browser');
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_COMMIT_SHA || undefined,
    });
  } catch (e) {
    // don't let Sentry failures break the app
    // eslint-disable-next-line no-console
    console.warn('Sentry init failed (client)', e);
  }
}

export function captureException(err: unknown, ctx?: Record<string, unknown>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/browser');
    Sentry.captureException(err as Error, { extra: ctx });
  } catch (e) {
    // ignore
  }
}
