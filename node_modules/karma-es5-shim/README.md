karma-es5-shim
==============

ES5 shim &amp; sham for Karma

# Installation:

    npm install karma-es5-shim [--save[-dev]]

Include it in your configuration file

    module.exports = {
        ...

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'requirejs', 'es5-shim', 'sinon-chai'],

        ...
    };