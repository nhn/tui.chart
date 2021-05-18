const path = require('path');
const devWebpackConfig = require('../webpack.config.js')({}, { mode: 'development' });

module.exports = {
  stories: ['@stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-knobs'],
  core: {
    builder: 'webpack5',
  },
  webpackFinal: async (config) => {
    config.module.rules = devWebpackConfig.module.rules;

    config.resolve.alias = {
      ...config.resolve.alias,
      'core-js/modules': path.resolve(__dirname, '../../../node_modules/core-js/modules'),
      '@src': path.resolve(__dirname, '../src/'),
      '@t': path.resolve(__dirname, '../types/'),
      '@stories': path.resolve(__dirname, '../stories/'),
    };

    config.devtool = 'eval-source-map';

    return config;
  },
};
