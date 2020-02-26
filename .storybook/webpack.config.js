const path = require('path');

module.exports = ({ config, mode }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader')
  });
  config.resolve.extensions.push('.ts', '.tsx');

  config.resolve.alias = {
    ...config.resolve.alias,
    '@src': path.resolve(__dirname, '../src/')
  };

  return config;
};
