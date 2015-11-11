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
        CALL_ME_BACK: 2,
        USERNAME_SET: 3,
        GET_USERNAME: 4
    };
    this.DEFAULT = {
        MEDIA: {
            AUDIO: true,
            VIDEO: true
        }
    };

    this.peer = undefined;
    this.username = undefined;
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
            path: SIGNALING_SERVER.PATH,
            config: {
                iceServers: [
                    { url: 'stun:stun.l.google.com:19302' },
                    { url: 'turn:185.65.245.105:3478', credential: '1234', username: 'test'}
                ]
            }
        });

        this.peer.on('error', this.errorHandler(this));
        this.peer.on('open', (function(self) {
            return function(id, data) {
                self.__log('Connection is established.');
                if (data.room.length == 1) {
                    self.connectedToRoom();
                    return;
                }

                for (var i in data.room) {
                    var peer_id = data.room[i];
                    if (peer_id == id) {
                        continue;
                    }

                    self.__debug('Connecting to ' + peer_id);
                    self.peers[peer_id] = self.peer.connect(peer_id);

                    self.peers[peer_id].on('open', (function(peer_id) {
                        return function() {
                            self.__debug('Connection to ' + peer_id + ' is established.');
                            self.tellMeYourUsername(peer_id);
                            connected = true;
                            for (var i in data.room) {
                                var pid = data.room[i];
                                connected &= id == pid || (self.peers[pid] && self.peers[pid].open);
                            }

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

    this.updateLocalMedia = function(data, callback) {
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
            self.audio = false;
            self.video = false;
            callback(this);
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
                    self.updateLocalMedia({audio: data.audio, video: false}, callback);
                } else if (data.audio) {
                    self.updateLocalMedia({audio: false, video: data.video}, callback);
                } else {
                    callback(self);
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
                    alert(error);
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
                self.chatMessageCallback({
                    message: data.payload.message,
                    username: self.peers[data.payload.peer].username
                });
            } else if (data.type == self.DATA_TRANSFER_TYPES.CALL_ME_BACK && self.localStream) {
                self.streams[peer_id] = self.peer.call(peer_id, self.localStream);
            } else if (data.type == self.DATA_TRANSFER_TYPES.USERNAME_SET) {
                self.peers[peer_id].username = data.payload.username;
            } else if (data.type == self.DATA_TRANSFER_TYPES.GET_USERNAME) {
                self.sendUsernameTo(peer_id);
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

            self.connectionClosedCallback(peer_id);
        }
    }

    this.sendChatMessage = function(msg) {
        if (!this.username) {
            return;
        }

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
        
        this.chatMessageCallback({
            message: msg,
            username: this.username
        });
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
        });
    }

    this.setUsername = function(username) {
        this.username = username;
        for (var peer_id in this.peers) {
            this.sendUsernameTo(peer_id);
        }
    }

    this.sendUsernameTo = function(peer_id) {
        if (peer_id && this.username) {
            this.peers[peer_id].send({
                type: this.DATA_TRANSFER_TYPES.USERNAME_SET,
                payload: {
                    username: this.username
                }
            });
        }
    }

    this.tellMeYourUsername = function(peer_id) {
        if (peer_id) {
            this.peers[peer_id].send({
                type: this.DATA_TRANSFER_TYPES.GET_USERNAME
            })
        }
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

    this.connectionClosedCallback = function(peer_id) {};
}