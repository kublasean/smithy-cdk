/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'tsdoc'],
    root: true,
    ignorePatterns: [
        "*.js",
        "*.d.ts",
    ],
    rules: {
        'tsdoc/syntax': 'warn'
    }
};