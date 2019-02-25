"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var stat = exports.stat = function stat(inputFileSystem, path) {
    return new Promise(function (resolve, reject) {
        inputFileSystem.stat(path, function (err, stats) {
            if (err) {
                reject(err);
            }
            resolve(stats);
        });
    });
};

var readFile = exports.readFile = function readFile(inputFileSystem, path) {
    return new Promise(function (resolve, reject) {
        inputFileSystem.readFile(path, function (err, stats) {
            if (err) {
                reject(err);
            }
            resolve(stats);
        });
    });
};