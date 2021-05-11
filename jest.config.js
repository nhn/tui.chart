module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'd.ts'],
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  setupFiles: ['jest-canvas-mock'],
};
