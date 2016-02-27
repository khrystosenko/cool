function addStreamsCallback(streams, loadMore) {
    if (!loadMore) {
        $('#streams').html('');
    }

    for (i in streams) {
        var stream = streams[i];
        var streamDiv = $('<div>');
        streamDiv.addClass('col s12 m4 stream');

        var card = $('<div>');
        card.addClass('card hoverable');
        streamDiv.append(card);

        var image = $('<div>');
        image.addClass('card-image waves-effect waves-block waves-light');
        image.attr('data-stream-id', stream.id);
        image.click(function(e) {
            e.preventDefault();

            var streamID = $(this).attr('data-stream-id');
            $.ajax({
                type: 'POST',
                url: '/room/add/',
                data: {
                    stream_id: streamID
                },
                success: function(data) {
                    if (data.error) {

                    } else {
                        // window.location.href = '/room/' + data.name;
                    }
                }, error: function() {

                }
            });
        });

        card.append(image);

        image.append('<a href="#"><img src="/img/blank.gif" data-echo="' + stream.preview + '"/></a>');

        var contentDiv = $('<div>');
        contentDiv.addClass('card-content grey-text');
        card.append(contentDiv);

        var detailsUL = $('<ul>');
        detailsUL.addClass('collection details');
        contentDiv.append(detailsUL);

        var detailsLI = $('<li>');
        detailsLI.addClass('collection-item card-black avatar');
        detailsUL.append(detailsLI);

        var streamLogo = $('<img src="/img/blank.gif" data-echo="' + stream.logo + '" class="circle">');
        detailsLI.append(streamLogo);

        var streamName = $('<p class="title white-text">' + stream.display_name + '</p>');
        detailsLI.append(streamName);

        var views = stream.viewers;
        var streamViews = $('<span class="views"><i class="tiny material-icons">visibility</i>' + views + '</span>');
        detailsLI.append(streamViews);

        var streamPlatform = $('<span class="platform"><i class="tiny material-icons"><!--googleoff: index-->stay_primary_landscape<!--googleon: index--></i> ' + stream.platform + '</span>');
        detailsLI.append(streamPlatform);

        if (stream.language) {
            var streamLanguage = $('<span class="language"><i class="tiny material-icons">translate</i>' + stream.language + '</span>')
            detailsLI.append(streamLanguage);
        }

        detailsLI.append('<span>Added: ' + stream.added + '</span>')

        $('#streams').append(streamDiv);
        echo.render();
    }
}

$(document).ready(function() {
    handlers.discover = new DiscoverHandler();
    handlers.discover.setSelectors({
        streamSearch: '#stream_search',
        gameFilter: '#game_filter',
        loadMore: '#load_more',
        progress: '.progress',
        search: '#srch'
    }).setEndpoints({
        search: '/search/'
    }).setCallbacks({
        addStreams: addStreamsCallback
    }).init();

    handlers.streams.init();
});



