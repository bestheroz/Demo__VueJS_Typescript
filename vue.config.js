// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
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
        additionalData: "@import '~@/assets/scss/vuetify/variables'",
      },
      scss: {
        additionalData: "@import '~@/assets/scss/vuetify/variables';",
      },
    },
  },
  productionSourceMap: false,
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.devtool = "hidden-source-map";
      config.plugins = [
        ...config.plugins, // this is important !
        new ForkTsCheckerWebpackPlugin({
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
          },
        }),
        process.env.VUE_APP_ENVIRONMENT === "production"
          ? new SentryWebpackPlugin({
              authToken:
                "d55afb6a392443ddbe98e05d8a079b7d4cceb631027843c5a70489e681d9bb70",
              org: "bestheroz",
              project: "demo-vuejs-typescript",
              include: "./dist",
              ignore: ["node_modules", "webpack.config.js"],
            })
          : undefined,
      ];
    } else {
      config.devtool = "eval";
    }
    config.output.pathinfo = false;
  },
  chainWebpack: (config) => {
    config.module
      .rule("tsx")
      .use("ts-loader")
      .options({ happyPackMode: true, transpileOnly: true });
  },
};
