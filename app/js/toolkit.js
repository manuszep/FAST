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
    var _resize_callbacks = [];
    var _mouse_move_callbacks = [];
    var _scroll_callbacks = [];

    var _handleWindowResize = function(e) {
        _executeEventCallbacks(this, e, _resize_callbacks);
        $(document).trigger('fast.toolkit.windowResize', e);
    };

    var _handleMouseMove = function(e) {
        _executeEventCallbacks(this, e, _mouse_move_callbacks);
        mouse.x = e.clientX || e.pageX;
        mouse.y = e.clientY || e.pageY

        $(document).trigger('fast.toolkit.mouseMove', e);
    };

    var _handleWindowScroll = function(e) {
        _executeEventCallbacks(this, e, _scroll_callbacks);
        $(document).trigger('fast.toolkit.windowScroll', e);
    };

    var _executeEventCallbacks = function(context, e, callbacks) {
        for (var i = 0; i < callbacks.length; i++) {
            var args = [e, callbacks[i].data];

            callbacks[i].func.apply(context, args);
        }
    };


    /**
     *  Public area
     */

    var mouse = {x: 0, y: 0};

    var registerResizeCallback = function(func, data) {
        _resize_callbacks.push({
            func: func,
            data: data
        });
    };

    var registerMouseMoveCallback = function(func, data) {
        _mouse_move_callbacks.push({
            func: func,
            data: data
        });
    };

    var registerScrollCallback = function(func, data) {
        _scroll_callbacks.push({
            func: func,
            data: data
        });
    };

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
     *  bindIntended()
     *
     *  Bind two events that will cancel each other if one of them is called right after the other (depends on the delay)
     *  The second event is considered as the "normal state". For example the mouseIn event should be declared first as
     *  the mouseOut is generally the initial state. The second event will only be executed if the first one is active.
     *  This is handy to cancel a hover event if the mouse has allready left the target.
     *
     *  @param event1 {Object} - {
     *      target: The element the event will be bound to,
     *      event: The jquery event to bind,
     *      data: Some data to pass to the callback,
     *      func: The event callback,
     *      delay: The timeframe in ms where the event can be cancelled
     *  }
     *  @param delay {Object} - {
     *      target: The element the event will be bound to,
     *      event: The jquery event to bind,
     *      data: Some data to pass to the callback,
     *      func: The event callback,
     *      delay: The timeframe in ms where the event can be cancelled
     *  }
     */
    var bindIntended = function(event1, event2) {
        var context;
        var args;
        var event1_timeout;
        var event2_timeout;
        var event1_active = false;
        var event2_active = true;
        event1.data = event1.data || {};
        event2.data = event2.data || {};

        var execEvent1 = function(e) {
            args = arguments;
            context = this;
            clearTimeout(event2_timeout);
            if (event2_active) {
                event1_timeout = setTimeout(function () {
                    event1.func.apply(context, args);

                    event1_active = true;
                    event2_active = false;
                }, event1.delay);
            }
        };

        var execEvent2 = function(e) {
            args = arguments;
            context = this;
            clearTimeout(event1_timeout);
            if (event1_active) {
                event2_timeout = setTimeout(function(){
                    event2.func.apply(context, args);

                    event1_active = false;
                    event2_active = true;
                }, event2.delay);
            }
        };

        event1.target.on(event1.event, event1.data, execEvent1);
        event2.target.on(event2.event, event2.data, execEvent2);
    };

    var UUID = function() {
        var lut = [];

        for (var i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }

        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;

        return lut[d0&0xff] + lut[d0>>8&0xff] + lut[d0>>16&0xff] + lut[d0>>24&0xff] + '-' +
            lut[d1&0xff] + lut[d1>>8&0xff] + '-' + lut[d1>>16&0x0f|0x40] + lut[d1>>24&0xff] + '-' +
            lut[d2&0x3f|0x80] + lut[d2>>8&0xff] + '-' + lut[d2>>16&0xff] + lut[d2>>24&0xff] +
            lut[d3&0xff] + lut[d3>>8&0xff] + lut[d3>>16&0xff] + lut[d3>>24&0xff];
    };


    /**
     *  Initialisation
     */
    $(window).on('resize', debounce(_handleWindowResize, 500));
    $(window).on('mousemove', throttle(_handleMouseMove, 10));
    $(window).on('scroll', debounce(_handleWindowScroll, 50));


    /**
     *  Module declarations
     */
    F.Toolkit = {
        mouse: mouse,
        is: is,
        isset: isset,
        now: thenow,
        throttle: throttle,
        debounce: debounce,
        bindIntended: bindIntended,
        UUID: UUID,
        registerResizeCallback: registerResizeCallback,
        registerMouseMoveCallback: registerMouseMoveCallback,
        registerScrollCallback: registerScrollCallback
    };
})(FAST, jQuery);
