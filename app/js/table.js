var FAST = FAST || {};

/**
 *  FAST.Table
 *
 *  @depends on
 *      - jQuery
 */

(function(F, $, undefined) {
    /**
     *  Private area
     */
    var _ = F.Toolkit;
    var header_bottom_pos;

    var _updateTableSize = function() {
        var scroller = $(this).data('scroller');

        scroller.width($(this).width());
    };

    var _handleScroll = function(e, data) {
        var table_top = data.parent.offset().top - $(window).scrollTop() - header_bottom_pos;
        var table_bottom = table_top + data.parent.height() + header_bottom_pos;

        if ((table_top < window.innerHeight - header_bottom_pos - 150) && (table_bottom > 50)) {
            if (table_bottom > window.innerHeight) {
                data.scroll_wrapper.css({'bottom': (table_bottom - window.innerHeight + 16) + 'px'});
            } else {
                data.scroll_wrapper.css({'bottom': '0'});
            }
        }
    };

    var _initTable = function() {
        // Prepare some markup to wrap the table and duplicate the table scroll
        var $scroll_wrapper = $('<div class="table-h-scroll-wrapper"></div>');
        var $scroll_scroller = $('<div class="table-h-scroll"></div>');
        var $wrapper = $('<div class="table-wrapper-wrapper"></div>');

        // Get the current table wrapper
        var $parent = $(this).parent();

        // Remove the natural table scrollbar
        $parent.css({'overflow': 'hidden'});

        $scroll_wrapper.append($scroll_scroller);

        // Wrap the table wrapper and add the artificial scroller
        $parent.wrap($wrapper).after($scroll_wrapper);

        // Bind the scroller to the table for later use
        $(this).data('scroller', $scroll_scroller);

        // If the markup changes, some things need to be recalculated
        $(this).on('DOMSubtreeModified', _updateTableSize);

        // Bind the scroller to the table scroll
        $scroll_wrapper.on('scroll', function(e) {
            $parent.scrollLeft($scroll_wrapper.scrollLeft());
        });

        // Watch the page scroll to position the scroller accordingly
        _.registerScrollCallback(_handleScroll, {
            parent: $parent,
            scroll_wrapper: $scroll_wrapper
        });

        _updateTableSize.apply($(this));
    };

    /**
     *  Public area
     */
    var init = function() {
        var $tables = $('table');
        var $header = $('.main-header.fixed');

        if ($header.length) {
            header_bottom_pos = $header.height();
        }

        $tables.each(_initTable);
    };

    /**
     *  Module declarations
     */
    F.Table = {
        init: init
    };
})(FAST, jQuery);
