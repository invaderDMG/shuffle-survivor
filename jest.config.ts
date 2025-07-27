/** @type {import('jest').Config} */
export default {
  // 1️⃣ Point Jest at ts-jest
  preset: 'ts-jest',

  // 2️⃣ Keep Node test environment unless you test DOM code
  testEnvironment: 'node',

  // 3️⃣ Tell Jest to transform TS and TSX
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },

  // 4️⃣ Optional: ignore Vite’s generated files
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/coverage'],
};
