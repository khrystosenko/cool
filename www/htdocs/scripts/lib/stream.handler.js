function StreamHandler() {
    this.inherite = BaseHandler;
    this.inherite();

    this.streams = {};
    this.currentStreamID = undefined;

    this.init = function(configs) {
        configs = configs || {};
        this.currentStreamID = configs.currentStreamID;
        this.myRoom = configs.myRoom === undefined ? false : configs.myRoom;
        this.framePresent = this.selectors.frameBox !== undefined && this.selectors.frameBox.length != 0

        $.ajax({
            type: 'GET',
            url: this.endpoints.userStreams,
            success: this.__loadSuccess(),
            error: this.__loadError()
        });
    }

    this.initCurrentStream = function() {
        if (!this.framePresent) {
            return;
        }

        if (!this.myRoom) {
            this.currentStreamID = 305;
        }
        
        if (this.currentStreamID === undefined) {
            this.currentStreamID = Cookies.get('latest_stream_id');
        }

        if (this.currentStreamID === undefined) {
            this.currentStreamID = Object.keys(this.streams)[0];
        }
    }

    this.buildStreamSwitcher = function() {
        for (var streamID in this.streams) {
            var stream = this.streams[streamID];
            var streamLink = $('<a>', {
                href: '',
                text: stream.display_name 
            });
            streamLink.click(this.streamClicked(streamID));
            this.selectors.switcher.append(streamLink);
            this.selectors.switcher.append(' <br/><hr/> ');
        }
    }

    this.streamClicked = function(streamID) {
        var self = this;
        return function(event) {
            event.preventDefault();
            Cookies.set('latest_stream_id', streamID, {expires: 365, path: '/'});

            if (!self.myRoom) {
                window.location.href = self.endpoints.room;
            }

            if (self.currentStreamID == streamID) {
                console.log('Do nothing');
                return;
            }
            
            self.currentStreamID = streamID;
            self.loadCurrentStream();
        }
    }

    this.loadCurrentStream = function() {
        if (!this.framePresent) {
            return;
        }

        var self = this;
        this.getStream(function(streams) {
            var stream = streams[0];
            console.log('Lock controls');
            var options = STREAM_BOXES[stream.platform];
            options.src = options.src.replace(CHANNEL, stream.name);

            self.selectors.frameBox.attr(options);
            console.log('Stream changed');
            console.log('Unlock controls');
        });
    }

    this.getStream = function(successCallback) {
        var stream = this.streams[this.currentStreamID];
        if (stream) {
            return successCallback([stream]);
        }

        $.ajax({
            type: 'GET',
            url: this.endpoints.stream,
            data: {
                stream_id: this.currentStreamID
            },
            success: successCallback
        })
    }

    this.__loadSuccess = function() {
        self = this;
        return function(streams) {
            for (var i in streams) {
                var stream = streams[i],
                    streamID = stream.id;

                delete stream.id;
                self.streams[streamID] = stream;
            }
            self.buildStreamSwitcher();

            if (self.framePresent) {
                self.initCurrentStream();
                self.loadCurrentStream();
            }
        }
    }

    this.__loadError = function() {}
}


CHANNEL = '{{ channel }}';
STREAM_BOXES = {
    'twitch.tv': {
        src: 'http://player.twitch.tv/?channel=' + CHANNEL,
        frameborder: '0',
        scrolling: 'no'
    },
    'hitbox': {
        src: 'http://www.hitbox.tv/#!/embed/' + CHANNEL + '?autoplay=true',
        frameborder: '0',
        scrolling: 'no'
    },
    'azubu': {
        src: 'http://www.azubu.tv/azubulink/embed=' + CHANNEL + '?autoplay=true',
        frameborder: '0',
        allowfullscreen: '1',
        webkitallowfullscreen: '1',
        mozallowfullscreen: '1'
    }
}
