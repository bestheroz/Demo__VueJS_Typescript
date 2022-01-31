// eslint-disable-next-line @typescript-eslint/no-var-requires
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

module.exports = {
  transpileDependencies: ["vuetify"],
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
        additionalData: '@import "~@/assets/scss/vuetify/variables"',
      },
      scss: {
        additionalData: '@import "~@/assets/scss/vuetify/variables";',
      },
    },
  },
  configureWebpack:
    process.env.VUE_APP_ENVIRONMENT === "production"
      ? {
          devtool: "source-map",
          plugins: [
            new SentryWebpackPlugin({
              url: "https://sentry.cubewiz.net/",
              // sentry-cli configuration
              authToken:
                "77f08c7d52d741829985f7ea0409d7f38898718b69d944f4a3bd040951af52dd",
              org: "cubewiz",
              project: "base-admin",

              // webpack-specific configuration
              include: "./dist",
              ignore: ["node_modules", "webpack.config.js"],
            }),
          ],
        }
      : {},
};
