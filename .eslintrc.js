// const { resolve } = require('path');module.exports = {
//   root: true,

//   parserOptions: {
//     extraFileExtensions: ['.vue'],
//     parser: '@typescript-eslint/parser',
//     project: resolve(__dirname, './tsconfig.json'),
//     tsconfigRootDir: __dirname,
//     ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
//     sourceType: 'module', // Allows for the use of imports
//   },

//   env: {
//     browser: true
//   },

//   extends: [
//     // Base ESLint recommended rules
//     // 'eslint:recommended',

//     // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
//     // ESLint typescript rules
//     // 'plugin:@typescript-eslint/eslint-recommended',
//     // 'plugin:@typescript-eslint/recommended',
//     // consider disabling this class of rules if linting takes too long
//     // 'plugin:@typescript-eslint/recommended-requiring-type-checking',

//     // https://eslint.vuejs.org/rules/#priority-a-essential-error-prevention
//     // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules
//     // 'plugin:vue/essential',

//     // --- ONLY WHEN USING PRETTIER ---
//     // https://github.com/prettier/eslint-config-prettier#installation
//     // usage with Prettier, provided by 'eslint-config-prettier'.
//     // 'prettier',
//     // 'prettier/@typescript-eslint',
//     // 'prettier/vue',
//   ],

//   // required to lint *.vue files
//   plugins: [
//     // '@typescript-eslint',
//     'vue',
//     // "unused-imports"
//   ],

//   globals: {
//     'ga': true, // Google Analytics
//     'cordova': true,
//     '__statics': true,
//     'process': true
//   },

//   // add your custom rules here
//   rules: {
//     // allow async-await
//     'generator-star-spacing': 'off',
//     // allow paren-less arrow functions
//     'arrow-parens': 'off',
//     'one-var': 'off',

//     'import/first': 'off',
//     'import/named': 'error',
//     'import/namespace': 'error',
//     'import/default': 'error',
//     'import/export': 'error',
//     'import/extensions': 'off',
//     'import/no-unresolved': 'off',
//     'import/no-extraneous-dependencies': 'off',
//     'prefer-promise-reject-errors': 'off',

//     // allow console.log during development only
//     'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
//     // allow debugger during development only
//     'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
//     "no-unused-vars": "off",
//     "unused-imports/no-unused-imports": "error",
//     "unused-imports/no-unused-vars": [
//       "warn",
//       {
//         "vars": "all",
//         "varsIgnorePattern": "^_",
//         "args": "after-used",
//         "argsIgnorePattern": "^_"
//       }
//     ],
//     '@typescript-eslint/explicit-function-return-type': 'off',
//   }
// }
