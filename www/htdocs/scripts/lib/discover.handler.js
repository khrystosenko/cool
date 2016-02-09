function DiscoverHandler() {
    this.inherite = BaseHandler;
    this.inherite();

    this.streamWidth = undefined;
    this.streamHeight = undefined;

    this.offset = 0;
    this.limit = 20;

    this.init = function(configs) {
        configs = configs || {};

        this.streamWidth = configs.streamWidth || 400;
        this.streamHeight = configs.streamHeight || 224;

        $(window).scroll(this.__autoLoad());
        this.selectors.search.keypress(this.__searchKeypress());

        this.selectors.streamSearch.find('label').click(this.__performSearch());
        this.selectors.gameFilter.find('a').click(this.__gameFilter());
        this.selectors.loadMore.click(this.__loadMore());

        this.getStreams();
    }

    this.getStreams = function(loadMore, afterCallback) {
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
            url: this.endpoints.search,
            success: this.__streamSuccessCallback(this, loadMore, afterCallback),
            error: this.__streamErrorCallback(this, afterCallback)
        });

    }

    this.__searchKeypress = function() {
        var self = this;
        return function(event) {
            if(event.which == 13) {
                event.preventDefault();
                self.selectors.streamSearch.find('label').click();
            }
        }
    }

    this.__autoLoad = function() {
        var self = this;
        return function(event) {
            if($(window).scrollTop() + $(window).height() >= $(document).height() * 0.8) {
                self.selectors.loadMore.click();
            }
        }
    }

    this.__performSearch = function() {
        var self = this;
        return function(event) {
            var searchValue = self.selectors.streamSearch.find('input').val().trim();
            if (searchValue == self.stream) {
                return;
            }

            self.offset = 0;
            self.stream = searchValue;
            self.getStreams(false);
        }
    }

    this.__gameFilter = function() {
        var self = this;
        return function(event) {
            var gameID = $(this).attr('data-game-id');
            var stream = self.selectors.streamSearch.find('input').val().trim();
            if (gameID == self.game && stream == self.stream) {
                return;
            }

            self.offset = 0;
            self.stream = stream;
            self.game = gameID;
            self.getStreams(false);
        }
    }

    this.__loadMore = function() {
        var self = this;
        return function(event) {
            event.preventDefault();
            self.getStreams(true);
            self.selectors.progress.show();
            self.selectors.progress.delay(1200).hide(0);
        }
    }

    this.__streamSuccessCallback = function(self, loadMore, afterCallback) {
        return function(data) {
            for (var i in data.data) {
                data.data[i].preview = data.data[i].preview.replace(/{width}/, self.streamWidth)
                                                           .replace(/{height}/, self.streamHeight);
                preloadImage(data.data[i].preview);
                self.offset += 1;

            }
            self.callbacks.addStreams(data.data, loadMore);
            if (afterCallback) afterCallback();
        }
    }


    this.__streamErrorCallback = function(self, afterCallback) {
        return function(error) {
            console.log(error);
            if (afterCallback) afterCallback();
        }
    }
}
