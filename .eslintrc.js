// .eslintrc.js example
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  ignorePatterns: ["node_modules/", "lib"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "no-empty": "warn",
  },

  overrides: [
    {
      files: ["**/*.test.[jt]s?(x)", "./jest.config.js"],
      env: {
        jest: true,
      },
      plugins: ["jest", "@typescript-eslint"],
      rules: {
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/ban-ts-comment": "ignore",
        "no-empty": "warn",
      },
    },
    {
      files: ["gulpfile.js"],
      env: {
        node: true,
      },
      plugins: ["@typescript-eslint"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
