var FAST = FAST || {};

/**
 *  FAST.Toolkit
 *
 *  @depends on
 *      - jQuery
 */

(function(F, $, undefined) {
    /**
     *  Private area
     */


    /**
     *  Public area
     */

    /**
     * is() Checks if an object matches given type
     * This overcomes the flaws of javacript's typeof
     * http://bonsaiden.github.io/JavaScript-Garden/#types.typeof
     *
     * @param obj {Object} - The object to test
     * @param type {String} - The type to match against
     *   Possible values : Arguments, Array, Boolean, Date, Error, Function, JSON, Math, Number, Object, RegExp, String
     * @returns {boolean}
     */
    var is = function(obj, type) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    };

    /**
     * isset() Checks if a variables is not undefined, nor null
     *
     * @param obj {Object} - The object to test
     * @returns {boolean}
     */
    var isset = function(obj) {
        return obj !== undefined && obj !== null;
    };


    /**
     *  Module declarations
     */
    F.Toolkit = {
        is: is,
        isset: isset
    };
})(FAST, jQuery);
