function updateHeaderHeight() {
    var windowHeight = $(window).height();
    $('#header-banner').height(windowHeight + 100);

    return windowHeight
}

function updateHeaderColor(height) {
    var scrollPos = $(document).scrollTop();
    if (scrollPos > height / 3) {
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

});