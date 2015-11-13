String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit)) : split;
}

function checkDevice(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 window.location.href = '/prerelease/';
    }
};

function preloadImage(url) {
    try {
        var _img = new Image();
        _img.src = url;
    } catch (e) { }
}

function getHoverImagePath(currentSource) {
    var file = currentSource.rsplit('.');
    return file[0] + '_hover.' + file[1];
}

function getImagePath(currentSource) {
    var file = currentSource.rsplit('.');
    return file[0].substring(0, file[0].length - 6) + '.' + file[1];
}

function changeImageOnHover(selector) {
    var image = $(selector);
    $(image).mouseover(function() {
        var currentSource = $(this).attr('src');
        $(this).attr('src', getHoverImagePath(currentSource));
    });

    $(image).mouseout(function() {
        var currentSource = $(this).attr('src');
        $(this).attr('src', getImagePath(currentSource));
    });
}

function setUpScrollable(selector) {
    $(selector).click(function() {
        var scrollTo = $(this).attr('data-scroll-to'),
            position;

        if (scrollTo == 'top') {
            position = 0;
        } else {
            position = $('#' + scrollTo).offset().top - 20;
        }
        $('html, body').animate({scrollTop: position}, 'slow');

        return false;
    });
}

function imageWithFallback(selector) {
    $(selector).error(function() {
        var fallbackImage = $(this).attr('data-fallback-src');
        if (this.src != fallbackImage) {
            this.src = fallbackImage;
        }
    });
}

$(document).ready(function() {
    changeImageOnHover('.hoverable-image');
    setUpScrollable('.scrollable-link');
    imageWithFallback('.img-with-fallback');
});