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
        $(document).on('mousemove.tooltip', {target: $container}, _.throttle(_followMouse, 10));
    };

    var _hideTooltip = function(e) {
        var $container = e.data.container;
        var index = e.data.index;

        $container.fadeOut();
        $(document).off('mousemove.tooltip');
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

    var _attachTooltip = function($target, content) {
        var $container = $('<div class="tooltip-content"></div>');
        var uuid = F.Toolkit.UUID();

        $container.attr('id', uuid).html(content);
        $body.append($container);

        $target.data('container-uuid', uuid).removeAttr('title')
            .on('mouseover.tooltip', { container: $container }, _showTooltip)
            .on('mouseout.tooltip', { container: $container }, _hideTooltip);
    };

    var _initTooltip = function() {
        var content = _extractTooltipContent($(this));

        _attachTooltip($(this), content);
    };

    /**
     *  Public area
     */
    var init = function() {
        $tooltips = $('.tooltip, [title]');

        $tooltips.each(_initTooltip);
    };

    var setTooltip = function($target, content) {
        _attachTooltip($target, content);
    };

    var destroyTooltip = function($target) {
        var container_id = $target.data('container-uuid');
        var $container = $('#' + container_id);

        $container.remove();
        $target.off('mouseover.tooltip').off('mouseout.tooltip');
    };


    /**
     *  Module declarations
     */
    F.Tooltip = {
        init: init,
        setTooltip: setTooltip,
        destroyTooltip: destroyTooltip
    };
})(FAST, jQuery);