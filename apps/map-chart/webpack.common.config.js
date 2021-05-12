/* eslint-disable */
const path = require('path');

module.exports = (env, { mode }) => {
  const { minify } = env;

  return {
    entry: ['./src/index.ts'],
    output: {
      library: {
        export: 'default',
        type: 'umd',
        name: ['toastui', 'MapChart'],
      },
      filename: `toastui-map-chart${minify ? '.min' : ''}.js`,
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/dist',
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      alias: {
        '@src': path.resolve(__dirname, 'src/'),
        '@t': path.resolve(__dirname, 'types/'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            envName: mode,
          },
        },
      ],
    },
  };
};
