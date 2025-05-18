module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  overrides: [
    // Configuration files and other JS files
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      parser: 'espree',
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    // TypeScript files
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
  rules: {
    'no-console': 'warn',
  },
  ignorePatterns: [
    'dist/**/*',
    'node_modules/**/*',
    '**/*.d.ts',
    '**/*.js', // Ignore all JS files by default - they're handled by the override
  ],
};
