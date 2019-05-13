(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.KldValidator = {}));
}(this, function (exports) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  /**
   *  Validator.js
   *
   *  @copyright 2019, Kevin Lindsey
   *  @module Validator
   */
  var Validator = function Validator() {
    _classCallCheck(this, Validator);
  };

  /**
   * @module kld-runtime-validator
   */

  exports.Validator = Validator;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
