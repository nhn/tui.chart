module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'd.ts'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1'
  },
  globals: {
    'ts-jest': {
      babelConfig: true
    }
  },
  watchPathIgnorePatterns: ['<rootDir>/.storybook', '<rootDir>/.stories', '/node_modules/']
};
