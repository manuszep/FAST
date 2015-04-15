var FAST = FAST || {};

/**
 *  FAST.Page
 *
 *  @depends on
 *      - jQuery
 */

(function(F, $, undefined) {
    /**
     *  Private area
     */
    var _initPanel = function() {
        var $el = $(this);

        if ($el.hasClass('may-minimise')) {
            _setupMinimiseFunction($el);
        }

        if ($el.hasClass('may-close')) {
            _setupCloseFunction($el);
        }

        $el.find('.panel-close').on('click', {target: $el}, _handleClose);
    };

    var _setupTopControlWrapper = function($el) {
        if ($el.data('top-controls')) {
            return $el.data('top-controls');
        }

        var $top_controls = $('<div class="top-controls"></div>');

        var $first_bg_color = $el.find('.panel-zone').eq(0);

        $top_controls.css({
            'background-color': $first_bg_color.css('backgroundColor'),
            'color': $first_bg_color.css('color')
        });

        $el.prepend($top_controls);
        $el.data('top-controls', $top_controls);

        return $top_controls;
    };

    var _setupMinimiseFunction = function($el) {
        var $top_controls = _setupTopControlWrapper($el);
        var $minimise_control = $('<div class="minimise"></div>');

        if ($el.data('title')) {
            var $title = $('<h4 class="title">' + $el.data('title') + '</h4>');
        } else {
            var $tmp_title = $el.find('h1, h2, h3, h4, h5, h6').eq(0);
            var $tmp_title_parent = $tmp_title.parent();
            var $title = $tmp_title.clone().addClass('title');
            $tmp_title.remove();

            console.log($tmp_title_parent);
            console.log($tmp_title_parent.text().length);
            if ($.trim($tmp_title_parent.text()).length == 0) {
                $tmp_title_parent.remove();
            }
        }

        $top_controls.append($title);
        $top_controls.append($minimise_control);
        $minimise_control.on('click', {target: $el}, _handleMinimise);
    };

    var _setupCloseFunction = function($el) {
        var $top_controls = _setupTopControlWrapper($el);
        var $close_control = $('<div class="close"></div>');

        $top_controls.append($close_control);
        $close_control.on('click', {target: $el}, _handleClose);
    };

    var _handleMinimise = function(e) {
        e.preventDefault();

        var $el = e.data.target;

        $el.find('.panel-zone, .actions').slideToggle();
        $el.toggleClass('minimised');
    };

    var _handleClose = function(e) {
        e.preventDefault();

        var $el = e.data.target;

        $el.fadeThenSlideToggle(200, function() {
           $(this).remove();
        });
    };

    /**
     *  Public area
     */
    var init = function() {
        $('.panel').each(_initPanel);
    };

    /**
     *  Module declarations
     */
    F.Panel = {
        init: init
    };
})(FAST, jQuery);
