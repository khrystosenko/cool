navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function PeerHandler(room_id, host, port, path) {
    this.host = host || '127.0.0.0';
    this.port = port || 9000;
    this.path = path || '/';
    this.room_id = room_id;

    this.ERROR = {
        FULL_ROOM: 401
    }

    this.LOG_LEVELS = {
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4,
        TRACE: 5
    }

    this.LOG_LEVEL = this.LOG_LEVELS.DEBUG;
    this.DATA_TRANSFER_TYPES = {
        CHAT: 1,
        CALL_ME_BACK: 2
    };
    this.EVENTS = {
        CHAT: 'chat-message'
    };
    this.DEFAULT = {
        MEDIA: {
            AUDIO: true,
            VIDEO: true
        }
    };

    this.peer = undefined;
    this.localStream = undefined;
    this.audio = false;
    this.video = false;
    this.peers = {};
    this.streams = {};

    this.init = function() {
        this.__log('Start initialization');
        this.peer = new Peer(room_id + '_' + this.__makeID(), {
            host: SIGNALING_SERVER.HOST,
            port: SIGNALING_SERVER.PORT,
            path: SIGNALING_SERVER.PATH
        });

        this.peer.on('error', this.errorHandler(this));
        this.peer.on('open', (function(self) {
            return function(id, data) {
                self.__log('Connection is established.');
                for (var i in data.room) {
                    var peer_id = data.room[i];
                    if (peer_id == id) {
                        continue;
                    }

                    self.__debug('Connecting to ' + peer_id);
                    self.peers[peer_id] = self.peer.connect(peer_id);

                    self.peers[peer_id].on('open', (function(peer_id) {
                        return function(id) {
                            self.__debug('Connection to ' + peer_id + ' is established.');
                            connected = true;
                            for (var i in self.peers) connected &= self.peers[i].open;
                            if (connected) {
                                self.connectedToRoom();
                            }
                        }
                    })(peer_id));
                    self.peers[peer_id].on('data', self.dataHandler(self, peer_id));
                    self.peers[peer_id].on('close', self.connectionClosed(self, peer_id));
                }
            }
        })(this));
        this.peer.on('connection', this.connectionHandler(this));
        this.peer.on('call', this.callHandler(this));
    }

    this.connectedToRoom = function() {
        this.call();
    }

    this.updateLocalMedia = function(data, callback, errorCallback, retry) {
        if (this.localStream) {
            if (this.audio && !data.audio) {
                this.localStream.getAudioTracks()[0].stop();
                this.audio = false;
            }

            if (this.video && !data.video) {
                this.localStream.getVideoTracks()[0].stop();
                this.video = false;
            }
        }

        if (!data.audio && !data.video) {
            if (retry) {
                errorCallback(this)
            } else {
                callback(this);
            }
            return
        }

        navigator.getUserMedia(data, (function(self) {
            return function(stream) {
                self.localStream = stream;
                self.audio = self.localStream.getAudioTracks().length == 1;
                self.video = self.localStream.getVideoTracks().length == 1;

                callback(self);
            }
        })(this), (function(self) {
            return function(error) {
                if (data.video) {
                    self.updateLocalMedia({audio: data.audio, video: false}, callback, errorCallback, true);
                } else if (data.audio) {
                    self.updateLocalMedia({audio: false, video: data.video}, callback, errorCallback, true);
                } else {
                    errorCallback(self);
                }
            }
        })(this));
    }

    this.errorHandler = function(self) {
        return function(error) {
            switch(error.code) {
                case self.ERROR.FULL_ROOM:
                    self.roomFullCallback();
                    break;
                default:
                    console.log(error);
            }
        }
    }

    this.connectionHandler = function(self) {
        return function (conn) {
            self.__log('Connection to ' + conn.peer + ' is established.');
            self.peers[conn.peer] = conn;

            self.peers[conn.peer].on('data', self.dataHandler(self, conn.peer));
            self.peers[conn.peer].on('close', self.connectionClosed(self, conn.peer));
        }
    }

    this.dataHandler = function(self, peer_id) {
        return function(data) {
            if (data.type == self.DATA_TRANSFER_TYPES.CHAT) {
                self.chatMessageCallback(data.payload);
            } else if (data.type == self.DATA_TRANSFER_TYPES.CALL_ME_BACK && self.localStream) {
                self.streams[peer_id] = self.peer.call(peer_id, self.localStream);
            }
        }
    }

    this.callHandler = function(self) {
        return function(call) {
            call.answer(self.localStream);
            call.on('stream', self.remoteStreamHandler(self, call.peer));
        }
    }

    this.remoteStreamHandler = function(self, peer_id) {
        return function(stream) {
            self.updateRemoteStreamCallback(stream, peer_id);
        }
    }

    this.connectionClosed = function(self, peer_id) {
        return function() {
            self.__log('Connection to ' + peer_id + ' was closed.');
            delete self.peers[peer_id];
        }
    }

    this.sendChatMessage = function(msg) {
        var payload = {
            message: msg,
            peer: this.peer.id
        };
        for (var i in this.peers) {
            this.__debug('Sending message: "' + msg + '" to ' + this.peers[i].peer);
            this.peers[i].send({
                type: this.DATA_TRANSFER_TYPES.CHAT,
                payload: payload
            });
        }
        this.chatMessageCallback(payload);
    }

    this.call = function(audio, video) {
        audio = audio == undefined ? this.DEFAULT.MEDIA.AUDIO : audio;
        video = video == undefined ? this.DEFAULT.MEDIA.VIDEO : video;

        this.updateLocalMedia({audio: audio, video: video}, function(self) {
            self.updateLocalStreamCallback(self.localStream, self.audio, self.video);

            for (var peer_id in self.peers) {
                var peer = self.peers[peer_id];
                if (self.localStream) {
                    self.streams[peer_id] = self.peer.call(peer_id, self.localStream);
                    self.streams[peer_id].on('stream', self.remoteStreamHandler(self, peer_id));
                } else {
                    self.peers[peer_id].send({
                        type: self.DATA_TRANSFER_TYPES.CALL_ME_BACK
                    })
                }
            }
        }, function(self) {
            self.webRTCNotSupportedCallback();
        });
    }

    this.__makeID = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for(var i=0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    this.__log = function(msg, priority) {
        var priority = priority || this.LOG_LEVELS.INFO;
        if (priority <= this.LOG_LEVEL) {
            console.log(msg);
        }
    }

    this.__debug = function(msg) {
        this.__log(msg, this.LOG_LEVELS.DEBUG);
    }


    this.__trigger_event = function(event_name, data) {
        var event = new CustomEvent(event_name, {data: data});
        this.dispatchEvent(event);
    }


    this.roomFullCallback = function() {};
    this.webRTCNotSupportedCallback = function() {};

    this.chatMessageCallback = function(data) {};
    this.updateLocalStreamCallback = function(stream, audio, video) {};
    this.updateRemoteStreamCallback = function(stream) {};
}