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
    var _handleWindowResize = function() {
        $(window).trigger('fast.toolkit.windowResize');
    };


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
     * thenow() A (possibly faster) way to get the current timestamp as an integer.
     */
    var thenow = Date.now || function() {
        return new Date().getTime();
    };

    /**
     *  throttle()
     *
     *  Returns a function, that, when invoked, will only be triggered at most once
     *  during a given window of time. Normally, the throttled function will run
     *  as much as it can, without ever going more than once per `wait` duration;
     *  but if you'd like to disable the execution on the leading edge, pass
     *  `{leading: false}`. To disable execution on the trailing edge, pass
     *  `{trailing: false}`.
     *
     *  @param func {Function} - The function to execute
     *  @param delay {Integer} - The time to wait between two function calls
     *  @param options {Object} - {leading: false, trailing: false}
     *  @returns {Function}
     */
    var throttle = function(func, delay, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;

        if (!options) options = {};

        var later = function() {
            previous = options.leading === false ? 0 : thenow();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        return function() {
            var now = thenow();

            if (!previous && options.leading === false) {
                previous = now;
            }

            var remaining = delay - (now - previous);

            context = this;
            args = arguments;

            if (remaining <= 0 || remaining > delay) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }

                previous = now;
                result = func.apply(context, args);

                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }

            return result;
        };
    };

    /**
     *  debounce()
     *
     *  Returns a function, that, as long as it continues to be invoked, will not
     *  be triggered. The function will be called after it stops being called for
     *  N milliseconds. If `immediate` is passed, trigger the function on the
     *  leading edge, instead of the trailing.
     *
     *  @param func {Function} - The function to execute
     *  @param delay {Integer} - The time to wait between two function calls
     *  @param immediate {Boolean} - Trigger at leading edge
     *  @returns {Function}
     */
    var debounce = function(func, delay, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = thenow() - timestamp;

            if (last < delay && last >= 0) {
                timeout = setTimeout(later, delay - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = thenow();

            var callNow = immediate && !timeout;

            if (!timeout) {
                timeout = setTimeout(later, delay);
            }

            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };


    /**
     *  Initialisation
     */
    $(window).on('resize', debounce(_handleWindowResize, 500));


    /**
     *  Module declarations
     */
    F.Toolkit = {
        is: is,
        isset: isset,
        now: thenow,
        throttle: throttle,
        debounce: debounce
    };
})(FAST, jQuery);
