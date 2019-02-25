module.exports = {
    rules: {
        // Possible Errors
        'for-direction': 2,
        'getter-return': [2, {'allowImplicit': false}],
        'array-callback-return': ['error', { 'allowImplicit': false }],
        'no-cond-assign': [2, 'always'],
        'no-console': 1,
        'no-constant-condition': 2,
        'no-control-regex': 2,
        'no-compare-neg-zero': 2,
        'no-debugger': 2,
        'no-dupe-args': 2,
        'no-dupe-keys': 2,
        'no-duplicate-case': 2,
        'no-empty-character-class': 2,
        'no-empty': [2, {'allowEmptyCatch': false}],
        'no-ex-assign': 2,
        'no-extra-boolean-cast': 2,
        'no-extra-parens': [2, 'functions'],
        'no-extra-semi': 2,
        'no-func-assign': 2,
        'no-inner-declarations': [2, 'both'],
        'no-invalid-regexp': 2,
        'no-irregular-whitespace': [2, {'skipComments': true}],
        'no-negated-in-lhs': 2,
        'no-obj-calls': 2,
        'no-prototype-builtins': 0,
        'no-regex-spaces': 2,
        'no-sparse-arrays': 2,
        'no-template-curly-in-string': 2,
        'no-unexpected-multiline': 2,
        'no-unreachable': 2,
        'use-isnan': 2,
        'valid-jsdoc': [2, {
            'prefer': {
                'return': 'returns'
            },
            'requireReturnDescription': false,
            'requireReturn': false
        }],
        'valid-typeof': 2
    }
};
