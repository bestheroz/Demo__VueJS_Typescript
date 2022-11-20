import vue2 from "@vitejs/plugin-vue2";
import Components from "unplugin-vue-components/vite";
import eslint from "vite-plugin-eslint";
import tsconfigPaths from "vite-tsconfig-paths";
import checker from "vite-plugin-checker";
import { defineConfig } from "vite";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import path from "path";
import { VuetifyResolver } from "unplugin-vue-components/resolvers";

export default defineConfig({
  plugins: [
    vue2(),
    Components({
      dts: false,
      resolvers: [VuetifyResolver()],
    }),
    tsconfigPaths(),
    eslint({ useEslintrc: true }),
    checker({ vueTsc: true }),
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 8081,
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      sass: {
        additionalData: [
          "@import '@/assets/scss/vuetify/variables'",
          "@import 'vuetify/src/styles/settings/_variables'",
          "",
        ].join("\n"),
      },
    },
  },
});
