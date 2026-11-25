import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'gallery-dist',
      'test-results',
      'playwright-report',
      'storybook-static',
      '!.storybook',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  ...storybook.configs['flat/recommended'],
  // Atomic levels: each level uses only the levels below it, so a block's
  // building pieces never depend on the blocks built from them.
  ...levels()
);

function levels() {
  const order = ['system', 'atoms', 'molecules', 'organisms', 'templates'];
  return order.slice(0, -1).map((level, i) => ({
    files: [`src/${level}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: order.slice(i + 1).map((higher) => ({
            group: [`../${higher}/*`, `./${higher}/*`],
            message: `${level} can't use ${higher}: it sits higher up.`,
          })),
        },
      ],
    },
  }));
}
