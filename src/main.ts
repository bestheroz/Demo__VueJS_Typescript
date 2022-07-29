import Vue from "vue";
import vuetify from "@/plugins/vuetify";
import App from "./App.vue";
import router from "./router";
import "./plugins/vee-validate";
import dotenv from "dotenv";
import "./assets/scss/theme.scss";
import envs from "@/constants/envs";
import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";
import { PiniaVuePlugin } from "pinia";
import pinia from "@/stores";

Vue.config.productionTip = process.env.NODE_ENV !== "production";
Vue.use(PiniaVuePlugin);

if (envs.SENTRY_DSN && envs.ENVIRONMENT !== "local") {
  Sentry.init({
    Vue: Vue,
    dsn: envs.SENTRY_DSN,
    environment: envs.ENVIRONMENT,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
      }),
    ],
    tracesSampleRate: envs.ENVIRONMENT === "production" ? 1.0 : 1.0, // Be sure to lower this in production
    tracingOptions: {
      trackComponents: true,
    },
  });
}

new Vue({
  pinia,
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

dotenv.config();
