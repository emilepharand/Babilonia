/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  "testMatch": ["<rootDir>/tests/api/**/*.ts"],
  "extensionsToTreatAsEsm": [".ts"],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testTimeout: 9999999,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
