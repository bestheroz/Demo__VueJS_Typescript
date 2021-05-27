import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";
import Vue from "vue";

if (process.env.VUE_APP_SENTRY_DSN) {
  Sentry.init({
    Vue: Vue,
    dsn: process.env.VUE_APP_SENTRY_DSN,
    environment: process.env.VUE_ENVIRONMENT,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: process.env.NODE_ENV === "production" ? 1.0 : 1.0, // Be sure to lower this in production
    tracingOptions: {
      trackComponents: true,
    },
  });
}
