(function ($) {
    
    'use strict';
    
    var NUMERIC_RE = /^\d+$/;
    
    // Math constants
    var THREE_PI_BY_TWO = 3 * Math.PI / 2;
    var TWO_PI = 2 * Math.PI;
    
    // Timing variables
    
    var total_milliseconds = null;
    var elapsed_milliseconds = 0;
    
    var INTERVAL_MILLISECONDS = 1000;
    var interval_id = null;
    
    // Canvas-related variables
    
    var canvas_size = 0;
    var canvas_element = null;
    var canvas_context = null;
    
    // CSS-classes
    var MEETING_RUNNING_CLASS = 'meeting-running';
    var MEETING_ENDED_CLASS = 'meeting-ended';
    
    var validate_minutes = function (event) {
        event.preventDefault();
        var minutes = $('#minutes').val();
        if (!NUMERIC_RE.test(minutes)) {
            display_error_message('Not a valid number of minutes');
            return;
        }
        
        var minutes_as_integer = parseInt(minutes, 10);
        if (minutes_as_integer < 1) {
            display_error_message('You must choose at least one minute');
            return;
        }
        total_milliseconds = minutes_as_integer * 60 * 1000;
        
        start_meeting();
    };
    
    var start_meeting = function () {
        $('body').addClass(MEETING_RUNNING_CLASS);
        elapsed_milliseconds = 0;
        interval_id = setInterval(update_pie, INTERVAL_MILLISECONDS);
        update_remaining_time_text(total_milliseconds);
        draw_pie(1);
    };
    
    var end_meeting = function () {
        clearInterval(interval_id);
        $('body')
            .removeClass(MEETING_RUNNING_CLASS)
            .addClass(MEETING_ENDED_CLASS);
    };
    
    var start_over = function () {
        $('body').removeClass(MEETING_ENDED_CLASS);
    };
    
    var update_pie = function () {
        elapsed_milliseconds += INTERVAL_MILLISECONDS;
        var remaining_milliseconds = total_milliseconds - elapsed_milliseconds;
        update_remaining_time_text(remaining_milliseconds);
        
        var proportion = remaining_milliseconds / total_milliseconds;
        if (proportion <= 0) {
            end_meeting();
        } else {
            draw_pie(proportion);
        }
    };
    
    var update_remaining_time_text = function (remaining_milliseconds) {
        var remaining_seconds = parseInt(remaining_milliseconds / 1000, 10);
        var display_seconds = remaining_seconds % 60;
        var remaining_minutes = parseInt(remaining_seconds / 60, 10);
        var display_minutes = remaining_minutes % 60;
        var display_hours = parseInt(remaining_minutes / 60, 10);

        var time_elements = $.map(
            [display_hours, display_minutes, display_seconds],
            pad_time
        );
        $('#feedback').text(time_elements.join(':'));
    };
    
    var draw_pie = function (proportion) {
        // Clear the contents of the canvas
        canvas_element.width = canvas_size;
        
        
        var half_size = parseInt(canvas_size / 2, 10);
        var radius = parseInt(half_size * 0.95, 10);

        var start_angle = THREE_PI_BY_TWO;
        var end_angle = start_angle - (proportion * TWO_PI);

        canvas_context.beginPath();
        canvas_context.moveTo(half_size, half_size);
        canvas_context.arc(
            half_size,
            half_size,
            radius,
            end_angle,
            start_angle,
            false
        );
        canvas_context.closePath();
        canvas_context.fillStyle = get_colour(proportion);
        canvas_context.fill();
    };
    
    var size_canvas = function () {
        var $window = $(window);
        var window_width = $window.width();
        var window_height = $window.height();
        
        canvas_size = Math.min(window_width, window_height);
        var canvas_size_pixels = canvas_size + 'px';
        
        $('#timer').css({width: canvas_size_pixels, height: canvas_size_pixels});
        
        $('#pie').attr({
            width: canvas_size,
            height: canvas_size
        });
    };
    
    // Utilities
    
    var display_error_message = function (message) {
        alert(message);
    };
    
    var get_colour = function (proportion_complete) {
        var proportion_elapsed = 1 - proportion_complete;
        var red;
        var green;
        
        if (proportion_elapsed < 1/3) {
            red = 765 * proportion_elapsed;
            green = 255;
        } else if (proportion_elapsed < 2/3) {
            red = 255;
            green = 51 * (8 - 9 * proportion_elapsed);
        } else {
            red = 255;
            green = 306 * proportion_complete;
        }
        
        return 'rgb(' + parseInt(red, 10) + ', ' + parseInt(green, 10) + ', 0)';
    };
    
    var pad_time = function (time_element) {
        var time_string = String(time_element);
        return (time_string.length === 1) ? '0' + time_string : time_string; 
    };
    
    
    $(function () {
        $(document).on('submit', 'form', validate_minutes);
        $(document).on('click', '#times-up a', function (event) {
            event.preventDefault();
            start_over();
        });
        
        canvas_element = $('canvas')[0];
        canvas_context = canvas_element.getContext('2d');
        
        $(window).on('resize', size_canvas);
        size_canvas();
    });
    
})(jQuery);
