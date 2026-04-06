module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Root directory
  rootDir: '.',

  // Test files pattern
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}',
  ],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/coverage/', '/public/'],

  // Transform files
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './.babelrc' }],
  },

  // Module name mappings
  moduleNameMapper: {
    // Assets
    '\\.(jpg|jpeg|png|gif|webp|svg|ico)$': '<rootDir>/__tests__/mocks/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/__tests__/mocks/styleMock.js',

    // Aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@context/(.*)$': '<rootDir>/src/context/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/index.jsx',
    '!src/main.jsx',
    '!src/reportWebVitals.jsx',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
  ],

  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/components/AI/': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    './src/pages/': {
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75,
    },
  },

  coverageDirectory: '<rootDir>/test/coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],

  // Watch plugins
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],

  // Global settings
  globals: {
    NODE_ENV: 'test',
  },

  // Verbose output
  verbose: true,

  // Mock timers
  fakeTimers: {
    enableGlobally: true,
  },

  // Module directories
  moduleDirectories: ['node_modules', 'src'],

  // Transform ignore patterns
  transformIgnorePatterns: ['/node_modules/(?!(@firebase|firebase|@testing-library)/)'],
};
