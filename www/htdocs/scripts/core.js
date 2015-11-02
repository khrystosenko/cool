String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit)) : split;
}

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

$(document).ready(function() {
	headerCurrentHeight = updateHeaderHeight();
	updateHeaderColor(headerCurrentHeight);
	changeImageOnHover('.hoverable-image');
	setUpScrollable('.scrollable-link');

    $(window).resize(function() {
        headerCurrentHeight = updateHeaderHeight();
        updateHeaderColor(headerCurrentHeight);
    });

    $(document).scroll(function() {
    	updateHeaderColor(headerCurrentHeight);
    });

});