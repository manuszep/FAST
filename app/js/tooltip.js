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

        $container.fadeIn();
        $(document).on('fast.toolkit.mouseMove.tooltip', {target: $container}, _followMouse);
        _setPosition($container);
    };

    var _hideTooltip = function(e) {
        var $container = e.data.container;

        $container.fadeOut();
        $(document).off('fast.toolkit.mouseMove.tooltip');
    };

    var _setPosition = function($target) {
        var target_width = $target.outerWidth(true);
        var target_height = $target.outerHeight(true);
        var window_width = window.innerWidth;
        var window_height = window.innerHeight;
        var pc_x = _.mouse.x / window_width;
        var css = {
            left: _.mouse.x - (target_width * pc_x),
            top: (_.mouse.y < (window_height / 2)) ? _.mouse.y : _.mouse.y - target_height
        };

        $target.css(css);
    };

    var _followMouse = function(e) {
        _setPosition(e.data.target);
    };

    var _attachTooltip = function($target, content) {
        var $container = $('<div class="tooltip-content"></div>');
        var uuid = F.Toolkit.UUID();

        $container.attr('id', uuid).html(content);
        $body.append($container);

        $target.data('container-uuid', uuid).removeAttr('title');

        _.bindIntended(
            {target: $target, event: 'mouseover.tooltip', data: {container: $container}, func: _showTooltip, delay: 300},
            {target: $target, event: 'mouseout.tooltip', data: {container: $container}, func: _hideTooltip, delay: 300}
        );
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