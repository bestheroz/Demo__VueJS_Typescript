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
    } else {
      config.devtool = "eval";
    }
    config.output.pathinfo = false;
  },
  chainWebpack: (config) => {
    config.module
      .rule("ts")
      .test(/\.ts$/)
      .use("ts-loader")
      .loader("ts-loader")
      .tap((opts) => {
        opts.transpileOnly = true;
        opts.happyPackMode = true;
        opts.appendTsSuffixTo = [/\.vue$/];
        return opts;
      });
    if (process.env.NODE_ENV === "production") {
      config.plugin("forkTsCheckerWebpack").use(
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require("fork-ts-checker-webpack-plugin"),
        [
          {
            typescript: {
              diagnosticOptions: {
                semantic: true,
                syntactic: true,
              },
            },
          },
        ],
      );
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
