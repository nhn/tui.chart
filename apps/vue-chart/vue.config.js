module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    resolve: {
      // https://cli.vuejs.org/guide/troubleshooting.html#symbolic-links-in-node-modules
      symlinks: false,
    },
  },
};
