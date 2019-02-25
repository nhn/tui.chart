'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (val) {
  return Object.prototype.toString.call(val) === '[object Object]' ? true : false;
};