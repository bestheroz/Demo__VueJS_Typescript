module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: false,
      jsx: false,
    },
    vueFeatures: {
      filter: true,
      interpolationAsNonHTML: false,
      styleCSSVariableInjection: true,
    },
  },
  env: {
    node: true,
    "vue/setup-compiler-macros": true, // DELETE: vue3 에서 제거
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/recommended",
    "@vue/prettier",
    "plugin:prettier/recommended",
    "@vue/typescript",
  ],
  plugins: ["vue", "@typescript-eslint"],
  rules: {
    "no-console":
      process.env.NODE_ENV === "production"
        ? ["error", { allow: ["info", "warn", "error"] }]
        : ["warn", { allow: ["info", "warn", "error"] }],
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "comma-dangle": "off",
    "no-cond-assign": ["error", "always"],
    "space-before-function-paren": "off",
    indent: "off",
    "prettier/prettier": "off",
    "lines-between-class-members": "off",
    "vue/no-v-text-v-html-on-component": "off",
    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": "off",
  },
};
