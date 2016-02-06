function StreamHandler(switcher, streamFrame) {

    this.streams = [];
    this.isOwner = false;

    this.switcher = $(switcher);
    this.streamFrame = $(streamFrame);

    this.currentIndex = undefined;

    this.init = function(roomStreams, isOwner) {
        this.streams = roomStreams;
        this.isOwner = isOwner;

        this.buildStreamSwitcher();
        this.initCurrentStream();
        this.loadCurrentStream();
    }

    this.initCurrentStream = function() {
        if (this.streams.length == 0) {
            return;
        }

        if (this.currentIndex === undefined) {
            console.log('Loading from cache')
        }

        if (this.currentIndex === undefined) {
            this.currentIndex = 0;
        }
    }

    this.buildStreamSwitcher = function() {
        for (var i in this.streams) {
            var stream = this.streams[i];
            var streamLink = $('<a>', {
                href: '',
                text: stream.display_name 
            });
            streamLink.click(this.streamClicked(i));
            this.switcher.append(streamLink);
        }
    }

    this.streamClicked = function(streamIndex) {
        var self = this;
        return function(event) {
            event.preventDefault();

            if (self.currentIndex == streamIndex) {
                console.log('Do nothing');
                return;
            }
            
            self.currentIndex = streamIndex;
            self.loadCurrentStream();
        }
    }

    this.loadCurrentStream = function() {
        var stream = this.streams[this.currentIndex];
        console.log('Lock controls');
        var options = STREAM_BOXES[stream.platform];
        options.src = options.src.replace(CHANNEL, stream.name);

        this.streamFrame.attr(options);
        console.log('Stream changed');
        console.log('Unlock controls');
    }
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
