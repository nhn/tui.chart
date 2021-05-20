module.exports = (env, args) => ({
  mode: args.mode,
  devServer: {
    injectClient: false,
    open: 'Google Chrome',
    overlay: {
      warnings: true,
      errors: true,
    },
    clientLogLevel: 'debug',
    stats: {
      color: true,
    },
    contentBase: __dirname,
    host: '0.0.0.0',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
      },
    ],
  },
  devtool: 'eval-source-map',
});
