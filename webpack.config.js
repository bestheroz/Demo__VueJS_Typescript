// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

module.exports = {
  devtool: process.env.NODE_ENV === "production" ? "hidden-source-map" : "eval",
  context: __dirname, // to automatically find tsconfig.json
  entry: "./src/index.ts",
  output: {
    pathinfo: false,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          // disable type checker - we will use it in fork plugin
          happyPackMode: true,
          transpileOnly: true,
        },
      },
    ],
  },
  plugins: [
    process.env.NODE_ENV === "production"
      ? new ForkTsCheckerWebpackPlugin({
          typescript: {
            diagnosticOptions: {
              semantic: true,
              syntactic: true,
            },
          },
        })
      : undefined,
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
  ],
};
