var FAST = FAST || {};

/**
 *  FAST.Tooltip
 */

(function(F, $, undefined) {
    /**
     *  Private area
     */
    var _ = F.Toolkit;
    var $tooltips;
    var $body = $('body');

    var _extractTooltipContent = function($e) {
        var content = $($e.data('tooltip-src')).html();

        if (!_.isset(content)) {
            content = $e.data('tooltip');
        }

        if (!_.isset(content)) {
            content = $e.attr('title');
        }

        return content;
    };

    var _showTooltip = function(e) {
        var $container = e.data.container;
        var index = e.data.index;

        $container.fadeIn();
        $(document).on('mousemove.tooltip_' + index, {target: $container}, _.throttle(_followMouse, 10));
    };

    var _hideTooltip = function(e) {
        var $container = e.data.container;
        var index = e.data.index;

        $container.fadeOut();
        $(document).off('mousemove.tooltip_' + index);
    };

    var _followMouse = function(e) {
        var $target = e.data.target;
        var target_width = $target.outerWidth(true);
        var target_height = $target.outerHeight(true);
        var window_width = window.innerWidth;
        var window_height = window.innerHeight;
        var pos_x = e.clientX;
        var pos_y = e.clientY;
        var pc_x = pos_x / window_width;
        var css = {
            left: pos_x - (target_width * pc_x),
            top: (pos_y < (window_height / 2)) ? pos_y : pos_y - target_height
        };

        $target.css(css);
    };

    var _initTooltip = function(index) {
        var content = _extractTooltipContent($(this));
        var $container = $('<div class="tooltip-content"></div>');

        $container.html(content);
        $body.append($container);

        $(this)
            .removeAttr('title')
            .on('mouseover', { container: $container, index: index }, _showTooltip)
            .on('mouseout', { container: $container, index: index }, _hideTooltip);
    };

    /**
     *  Public area
     */
    var init = function() {
        $tooltips = $('.tooltip, [title]');

        $tooltips.each(_initTooltip);
    };


    /**
     *  Module declarations
     */
    F.Tooltip = {
        init: init
    };
})(FAST, jQuery);