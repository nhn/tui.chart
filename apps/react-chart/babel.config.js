module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      ['@babel/preset-env', { modules: false, useBuiltIns: 'usage', corejs: 3 }],
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
    ],
  };
};
