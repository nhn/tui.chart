/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    demo: '/',
    src: '/dist',
  },
  plugins: ['@snowpack/plugin-react-refresh', '@snowpack/plugin-babel'],
  devOptions: {
    port: 8080,
  },
  buildOptions: {
    clean: true,
    sourceMaps: false,
    out: 'dist',
  },
  alias: {
    '@src': './src',
    '@t': './types',
  },
  workspaceRoot: '../../',
};
