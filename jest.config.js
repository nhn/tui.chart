module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'd.ts'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.ts',
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  setupFiles: ['jest-canvas-mock'],
  watchPathIgnorePatterns: ['<rootDir>/.storybook', '<rootDir>/.stories', '/node_modules/'],
};
