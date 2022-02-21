module.exports = {
  css: {
    extract:
      /* eslint-disable indent */
      process.env.NODE_ENV === "production"
        ? {
            ignoreOrder: true,
          }
        : false,
    /* eslint-enable indent */
    loaderOptions: {
      sass: {
        additionalData: "@import '~@/assets/scss/vuetify/variables'",
      },
      scss: {
        additionalData: "@import '~@/assets/scss/vuetify/variables';",
      },
    },
  },
  lintOnSave: process.env.NODE_ENV !== "production",
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.devtool = "source-map";
    } else {
      config.devtool = "eval-source-map";
    }
    config.output.pathinfo = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
  },
  chainWebpack: (config) => {
    config
      .plugin("NodePolyfillPlugin")
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      .use(require("node-polyfill-webpack-plugin"));
    if (process.env.VUE_APP_ENVIRONMENT === "production") {
      config
        .plugin("sentryWebpack")
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .use(require("@sentry/webpack-plugin"), [
          {
            authToken:
              "d55afb6a392443ddbe98e05d8a079b7d4cceb631027843c5a70489e681d9bb70",
            org: "bestheroz",
            project: "demo-vuejs-typescript",
            include: "./dist",
            ignore: ["node_modules", "webpack.config.js"],
          },
        ]);
    }
  },
};
