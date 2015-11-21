function updateHeaderHeight() {
    var windowHeight = $(window).height();
    $('#header-banner').height(windowHeight - 108);

    return windowHeight;
}

function updateHeaderColor(height) {
    var scrollPos = $(document).scrollTop();
    if (scrollPos > ((height / 3)-60)) {
        $('#menu nav').attr('class', 'grey darken-3');
    } else {
        $('#menu nav').attr('class', 'header-transparent');
    }
}

$(document).ready(function() {

    headerCurrentHeight = updateHeaderHeight();
    updateHeaderColor(headerCurrentHeight);

    $(window).resize(function() {
        headerCurrentHeight = updateHeaderHeight();
        updateHeaderColor(headerCurrentHeight);
    });

    $(document).scroll(function() {
        updateHeaderColor(headerCurrentHeight);
    });

    $('#create-room-btn').click(function(e) {
        e.preventDefault();
        $(this).addClass('disabled');
        var link = $('#stream-link').val().trim();

        $.ajax({
            type: 'POST',
            url: '/room/create/',
            data: {
                link: link
            },
            success: function(data) {
                console.log(data);
                if (data.error) {
                    $('#stream-link').addClass('invalid');
                    $('#create-room-btn').removeClass('disabled');
                } else {
                    $('#stream-link').removeClass('invalid');
                    $('#create-room-btn').removeClass('disabled');
                    window.location.href = '/room/' + data.name; 
                }
            }, error: function() {
                
            }
        });
    });

    $('.card-image').click(function(e) {
        e.preventDefault();

        var link = $(this).attr('data-stream-url');
        $.ajax({
            type: 'POST',
            url: '/room/create/',
            data: {
                link: link
            },
            success: function(data) {
                console.log(data);
                if (data.error) {} else {
                    window.location.href = '/room/' + data.name; 
                }
            }, error: function() {}
        });

    });

});