module.exports = {
  root: true,

  env: {
    node: true
  },
  globals: {
    console: true,
    globalThis: true,
    wx: true
  },

  parserOptions: {
    parser: "babel-eslint"
  },
  plugins: ["vue", "prettier"],
  rules: {
    // "no-undef": "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    // "prettier/prettier": "error"
    "no-console": "off",
    "no-unused-vars": "off"
  },
  extends: ["eslint:recommended", "plugin:vue/essential"]
  // extends: ["plugin:vue/essential", "eslint:recommended", "@vue/prettier"]
};
