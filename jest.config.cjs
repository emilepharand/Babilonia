/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  "testMatch": ["<rootDir>/tests/api/**/*.ts"],
  "testPathIgnorePatterns": ["utils.ts"],
  "extensionsToTreatAsEsm": [".ts"],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/tests/coverage/jest',
  collectCoverageFrom: [
    'server/**/*',
  ],
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
    testSequencer: './tests/api/testSequencer.cjs',
    bail: true,
};
