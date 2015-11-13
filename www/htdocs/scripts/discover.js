function DiscoverHandler() {
    this.searchURL = '/search/'

    this.streamWidth = 400;
    this.streamHeight = 224;

    this.offset = 0;
    this.limit = 9;

    this.searchElement = null;
    this.gameFilterElement = null;

    this.getStreams = function(loadMore) {
        data = {
            offset: this.offset,
            limit: this.limit,
            game: this.game
        }

        if (this.stream) {
            data.stream = this.stream;
        }

        $.ajax({
            type: 'GET',
            data: data,
            url: this.searchURL,
            success: this.__streamSuccessCallback(this, loadMore),
            error: this.__streamErrorCallback(this)
        });

    }

    this.init = function(configs) {
        this.searchElement = $('#' + configs.streamSearchID);
        this.gameFilterElement = $('#' + configs.gameFilterID);
        this.loadMoreElement = $('#' + configs.loadMoreID);

        this.addStreamsCallback = configs.addStreamsCallback;

        this.searchElement.find('label').click((function(self) {
            return function() {
                var searchValue = self.searchElement.find('input').val().trim();
                if (searchValue == self.stream) {
                    return;
                }

                self.offset = 0;
                self.stream = searchValue;
                self.getStreams(false);
            }
        })(this));
        this.gameFilterElement.find('a').click((function(self) {
            return function() {
                var gameID = $(this).attr('data-game-id');
                var stream = self.searchElement.find('input').val().trim();
                if (gameID == self.game && stream == self.stream) {
                    return;
                }

                self.offset = 0;
                self.stream = stream;
                self.game = gameID;
                self.getStreams(false);
            }
        })(this));
        this.loadMoreElement.click((function(self) {
            return function() {
                self.getStreams(true);
            }
        })(this));

        this.getStreams();
    }

    this.__streamSuccessCallback = function(self, loadMore) {
        return function(data) {
            for (var i in data.data) {
                data.data[i].preview = data.data[i].preview.replace(/{width}/, self.streamWidth)
                                                           .replace(/{height}/, self.streamHeight);
                preloadImage(data.data[i].preview);
                self.offset += 1;

            }
            self.addStreamsCallback(data.data, loadMore);
        }
    }

    this.__streamErrorCallback = function(self) {
        return function(error) {
            console.log(error);
        }
    }

}

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
        image.attr('data-stream-url', 'http://twitch.tv/' + stream.name);
        image.click(function(e) {
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
                    if (data.error) {
                        
                    } else {
                        window.location.href = '/room/' + data.name; 
                    }
                }, error: function() {
                    
                }
            });
        });
        
        card.append(image);

        image.append('<a href="#"><img src="' + stream.preview + '"/></a>');

        var contentDiv = $('<div>');
        contentDiv.addClass('card-content grey-text');
        card.append(contentDiv);

        var detailsUL = $('<ul>');
        detailsUL.addClass('collection details');
        contentDiv.append(detailsUL);

        var detailsLI = $('<li>');
        detailsLI.addClass('collection-item card-black avatar');
        detailsUL.append(detailsLI);

        var streamLogo = $('<img src="' + stream.logo + '" class="circle">');
        detailsLI.append(streamLogo);

        var streamName = $('<p class="title white-text">' + stream.display_name + '</p>');
        detailsLI.append(streamName);

        var views = stream.viewers;
        var streamViews = $('<span class="views"><i class="tiny material-icons">visibility</i>' + views + '</span>');
        detailsLI.append(streamViews);

        var streamPlatform = $('<span class="platform"><i class="tiny material-icons">stay_primary_landscape</i> TWITCH.TV</span>');
        detailsLI.append(streamPlatform);

        var streamLanguage = $('<span class="language"><i class="tiny material-icons">translate</i>' + stream.language + '</span>')
        detailsLI.append(streamLanguage);

        $('#streams').append(streamDiv);
    }
}

$(document).ready(function() {
    var handler = new DiscoverHandler();
    handler.init({
        streamSearchID: 'stream_search',
        gameFilterID: 'game_filter',
        loadMoreID: 'load_more',
        addStreamsCallback: addStreamsCallback
    });


    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            $('#load_more').click();
        }
    });
});


 //  $('input').keypress(function(e) {
 //        if(e.which == 13) {
 //            $(this).blur();
 //            $('#srch').focus().click();
 //        }
 //    });

 $(document).ready(function() {
    $('input').blur(function(){
        $("#icon_status").html("search");
    })
    .focus(function() {
        $("#icon_status").html("close");
      });
  });

 