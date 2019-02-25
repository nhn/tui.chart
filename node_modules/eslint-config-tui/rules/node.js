module.exports = {
    env: {
        'node': true,
        'commonjs': true
    },
    rules: {
        // Node.js and CommonJS
        'global-require': 2,
        'handle-callback-err': 2,
        'no-mixed-requires': [2, true],
        'no-new-require': 2,
        'no-path-concat': 2,
        'no-process-exit': 2,
        'no-restricted-modules': 0,
        'no-sync': [2, {'allowAtRootLevel': false}],
        'no-buffer-constructor': 2
    }
};
