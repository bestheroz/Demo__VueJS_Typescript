import vue2 from "@vitejs/plugin-vue2";
import Components from "unplugin-vue-components/vite";
import eslint from "vite-plugin-eslint";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
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
    eslint(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 8081,
  },
  css: {
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
