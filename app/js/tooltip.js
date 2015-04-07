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
        // Get an eventual markup stored in an external element
        var content = $($e.data('tooltip-src')).html();

        // Check if that markup was found and if not, get the data-tooltip attribute.
        if (!_.isset(content)) {
            content = $e.data('tooltip');
        }

        // Now if data-tooltip does not exist, we use the title.
        if (!_.isset(content)) {
            content = $e.attr('title');
        }

        return content;
    };

    var _showTooltip = function(e) {
        var $container = e.data.container;

        $container.fadeIn();
        // Listen to the toolkit mousemove event (and add tooltip namespace).
        $(document).on('fast.toolkit.mouseMove.tooltip', {target: $container}, _followMouse);
        // Initiate the tooltip position in case the user stops moving before the tooltip appears.
        _setPosition($container);
    };

    var _hideTooltip = function(e) {
        var $container = e.data.container;

        $container.fadeOut();
        $(document).off('fast.toolkit.mouseMove.tooltip'); // Stop listening to mouse
    };

    var _setPosition = function($target) {
        // Compute the size of the tooltip
        var target_width = $target.outerWidth(true);
        var target_height = $target.outerHeight(true);
        // Compute the size of the window
        var window_width = window.innerWidth;
        var window_height = window.innerHeight;
        // Get the position of the mouse (horizontally) in percents
        var pc_x = _.mouse.x / window_width;
        var css = {
            // Use the negative proportion of the mouse position to offset the tooltip.
            left: _.mouse.x - (target_width * pc_x),
            // Check if the mouse is above or under hald the window and position the tooltip accordingly.
            top: (_.mouse.y < (window_height / 2)) ? _.mouse.y : _.mouse.y - target_height
        };

        $target.css(css);
    };

    var _followMouse = function(e) {
        _setPosition(e.data.target);
    };

    var _attachTooltip = function($target, content) {
        var $container = $('<div class="tooltip-content"></div>'); // Create an empty container for the tooltip
        var uuid = F.Toolkit.UUID();

        $container.attr('id', uuid).html(content); // Set the ID and the content of the tooltip
        $body.append($container);

        // Store the container ID in case we need to find it back
        // Remove the title to avoid standard tooltips
        $target.data('container-uuid', uuid).removeAttr('title');

        // Set mouseIn and mouseOut events and make them cancellable.
        // Pass the container to avoid excessive lookups
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
        // Find the attached container.
        var container_id = $target.data('container-uuid');
        var $container = $('#' + container_id);

        // Remove that container
        $container.remove();
        // Unbind hover events from the target.
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