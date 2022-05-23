module.exports = {
  // ckeditor5 관련 설정
  transpileDependencies: [/ckeditor5-[^/\\]+[/\\]src[/\\].+\.js$/],
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
    // CKEDITOR 관련 설정 START
    config.plugin("CKEditorWebpackPlugin").use(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      new (require("@ckeditor/ckeditor5-dev-webpack-plugin"))({
        // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
        language: "ko",
        // Append translations to the file matching the `app` name.
        translationsOutputFile: /app/,
      }),
    );
    // (1.) To handle editor icons, get the default rule for *.svg files first:
    const svgRule = config.module.rule("svg");

    // Then you can either:
    //
    // * clear all loaders for existing 'svg' rule:
    //
    //		svgRule.uses.clear();
    //
    // * or exclude ckeditor directory from node_modules:
    svgRule.exclude.add(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("path").join(__dirname, "node_modules", "@ckeditor"),
    );

    // Add an entry for *.svg files belonging to CKEditor. You can either:
    //
    // * modify the existing 'svg' rule:
    //
    //		svgRule.use( 'raw-loader' ).loader( 'raw-loader' );
    //
    // * or add a new one:
    config.module
      .rule("cke-svg")
      .test(/ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/)
      .use("raw-loader")
      .loader("raw-loader");

    // (2.) Transpile the .css files imported by the editor using PostCSS.
    // Make sure only the CSS belonging to ckeditor5-* packages is processed this way.
    config.module
      .rule("cke-css")
      .test(/ckeditor5-[^/\\]+[/\\].+\.css$/)
      .use("postcss-loader")
      .loader("postcss-loader")
      .tap(() => {
        return {
          postcssOptions:
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require("@ckeditor/ckeditor5-dev-utils").styles.getPostCssConfig({
              themeImporter: {
                themePath: require.resolve("@ckeditor/ckeditor5-theme-lark"),
              },
              minify: true,
            }),
        };
      });
    // CKEDITOR 관련 설정 end
  },
};
