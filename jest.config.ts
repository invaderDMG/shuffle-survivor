/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',  // ✅ This provides DOM APIs
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/coverage'],
  // Optional: Configure jsdom
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};
