module.exports = {
    extends: [
        './rules/best-practices',
        './rules/errors',
        './rules/es6',
        './rules/node',
        './rules/strict',
        './rules/style',
        './rules/variables'
    ].map(require.resolve),
    env: {
        'browser': true,
        'es6': true
    }
};
