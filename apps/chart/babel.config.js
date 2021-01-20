module.exports = (api) => {
  const env = api.env();

  return {
    presets: [
      [
        '@babel/preset-env',
        env === 'polyfill'
          ? {
              useBuiltIns: 'usage',
              debug: false,
              modules: 'auto',
              corejs: 3,
            }
          : {},
      ],
      '@babel/preset-typescript',
    ],
    plugins: [
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-optional-chaining',
    ],
  };
};
