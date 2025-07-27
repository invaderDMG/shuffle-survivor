/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/coverage'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // ✅ Add CSS handling configuration
  moduleNameMapper: {
    // Mock CSS and CSS modules
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Optional: If you want absolute imports
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@game/(.*)$': '<rootDir>/src/game/$1',
  },
  testEnvironmentOptions: {
    url: 'http://localhost',
  },
};
