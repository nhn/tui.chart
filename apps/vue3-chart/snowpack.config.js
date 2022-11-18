/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    demo: '/',
    src: '/dist',
  },
  devOptions: {
    port: 8085,
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
