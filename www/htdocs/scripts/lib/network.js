function NetworkHandler(roomID, host, port) {
    this.host = host || '127.0.0.1';
    this.port = port || 8888;
    this.roomID = roomID;

    this.socket = null;
    this.localMedia = null;
    this.connected = false;
    this.emptyChat = true;
    this.participants = 0;

    this.audio = false;
    this.video = false;

    this.audioTry = false;
    this.videoTry = false;

    this.notifications = true;

    this.peers = {};
    this.streams = {};

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

    this.DEFAULT = {
        MEDIA: {
            AUDIO: true,
            VIDEO: true,
            VOLUME: 30
        },
        CHAT: {
            FADE: 150,
            TYPING_TIMER: 400,
        }
    }

    this.ICE_SERVERS = [
        {
          'url': 'stun:stun.l.google.com:19302'
        },
        {
          'url': 'turn:185.65.245.105:3478',
          'username': 'test',
          'credential': '1234'
        }
    ]

    this.webRTCSupport = true;

    this.socketConnectedCallback = function(self) {
        return function() {
            console.log('Socket connected.');
        }
    }

    this.socketError = function(self) {
        return function(data) {
            console.log(data.msg);
        }
    }

    this.socketDisconnectedCallback = function(self) {
        return function() {
            console.log('Socket disconnected.');

            for (socket_id in self.peers) {
                self.peers[socket_id].close();
                delete self.peers[socket_id];
            }
        }
    }

    this.socketLoginCallback = function(self) {
        return function(data) {
            self.connected = true;
        }
    }

    this.userJoinedCallback = function(self) {
        return function(data) {
            self.socket.id = data.socket_id;
            self.emptyChat = data.empty;
            self.participants = data.numUsers;
            self.userInitializedCallback();
        }
    }

    this.userLeftCallback = function(self) {
        return function(data) {
            self.participants = data.numUsers;
            self.participantLeftCallback();
        }
    }

    this.chatUpdateCallback = function(self) {
        return function(data) {
            if (data.socket_id != self.socket.id && self.notifications && data.username != 'SERVER') {
              ion.sound.play("button_click");
            }
            self.emptyChat = false;
            self.chatMessageCallback(data);
        }
    }

    this.typingCallback = function(self) {
        return function(data) {}
    }

    this.typingStopCallback = function(self) {
        return function(data) {}
    }

    this.peerAddCallback = function(self) {
        return function(data) {
            console.log('Signaling server said to add peer:', data);

            var socketID = data.socket_id;
            if (socketID in self.peers) {
                console.log('Already connected to peer ', socketID);
                return;
            }

            self.participants = data.numUsers;
            self.participantAddCallback();

            var peerConnection = new navigator.RTCPeerConnection(
                {iceServers: self.ICE_SERVERS},
                {optional: [{DtlsSrtpKeyAgreement: true}]}
            );

            self.peers[socketID] = peerConnection;

            if (self.socket.id != socketID) {
                self.updateRemoteStreamCallback(event.stream, socketID);
            }

            peerConnection.onicecandidate = self.__onICECandidate(self, socketID);
            peerConnection.onaddstream = self.__onAddStream(self, socketID);

            if (self.localMedia) {
                peerConnection.addStream(self.localMedia);
            }

            if (data.create_offer) {
                self.__createOffer(socketID, data.audio, data.video);
            }
        }
    }

    this.sessionDescriptionCallback = function(self) {
        return function(data) {
            console.log('Remote description received: ', data);
            var socketID = data.socket_id;
            var remoteDescription = data.session_description;
            console.log(remoteDescription);

            var desc = new navigator.RTCSessionDescription(remoteDescription);
            self.peers[socketID].setRemoteDescription(desc,
                (function(self, socketID, remoteDescription) {
                    return function() {
                        console.log('setRemoteDescription succeeded');
                        if (remoteDescription.type == "offer") {
                            console.log("Creating answer");
                            self.peers[socketID].createAnswer(function(localDescription) {
                                console.log('Answer description is: ', localDescription);
                                self.peers[socketID].setLocalDescription(localDescription,
                                    function() {
                                        self.socket.emit('session_description-relay',
                                            {'socket_id': socketID, 'session_description': localDescription});
                                        console.log('Answer setLocalDescription succeeded');
                                    },
                                    function() { console.log('Answer setLocalDescription failed!'); }
                                );
                            },
                            function(error) {
                                console.log('Error creating answer: ', error);
                                console.log(peer);
                            });
                        }
                }
                })(self, socketID, remoteDescription),
                function(error) {
                    console.log('setRemoteDescription error: ', error);
                }
            );
            console.log('Description Object: ', desc);
        }
    }

    this.ICECandidateCallback = function(self) {
        return function(data) {
            var iceCandidate = data.ice_candidate;
            self.peers[data.socket_id].addIceCandidate(new navigator.RTCIceCandidate(iceCandidate));
        }
    }

    this.peerRemovedCallback = function(self) {
        return function(data) {
            console.log('Signaling server said to remove peer:', data);
            var socketID = data.socket_id;
            self.connectionClosedCallback(socketID);
            if (socketID in self.peers) {
                self.peers[socketID].close();
                delete self.peers[socketID];
            }
        }
    }

    this.init = function() {
        this.__pre_config();

        if (!this.webRTCSupport) {
            return;
        }

        this.updateLocalStreamCallback(null, false, false);

        this.socket = io.connect(this.host + ':' + this.port);

        this.socket.emit('initialize', this.roomID);

        this.socket.on('connect', this.socketConnectedCallback(this));
        this.socket.on('error', this.socketError(this));
        this.socket.on('disconnect', this.socketDisconnectedCallback(this));
        this.socket.on('login', this.socketLoginCallback(this));

        this.socket.on('user-joined', this.userJoinedCallback(this));
        this.socket.on('user-left', this.userLeftCallback(this));

        this.socket.on('chat-update', this.chatUpdateCallback(this));

        this.socket.on('typing', this.typingCallback(this));
        this.socket.on('typing-stop', this.typingStopCallback(this));

        this.socket.on('peer-add', this.peerAddCallback(this));
        this.socket.on('peer-remove', this.peerRemovedCallback(this));

        this.socket.on('session_description', this.sessionDescriptionCallback(this));

        this.socket.on('ice_candidate', this.ICECandidateCallback(this));

    }

    this.setUsername = function(username) {
        this.socket.emit('chat-join', {username: username})
    }

    this.sendChatMessage = function(message) {
        if (message && this.connected) {
            this.socket.emit('chat-send', message);
        }
    }

    this.toggleLocalStream = function(audio, video) {
        this.setupLocalMedia((function(self) {
            return function(reconnect) {
                self.socket.emit('stream-update', self.audio, self.video);
                if (!reconnect) return;

                for (socketID in self.peers) {
                    if (self.streams[socketID]) self.peers[socketID].removeStream(self.localMedia);
                    self.peers[socketID].addStream(self.localMedia);
                    self.__createOffer(socketID, self.audio, self.video);
                }
            }
        })(this), audio, video);


        this.updateLocalStreamCallback(this.localMedia, this.audio, this.video);
    }

    this.setupLocalMedia = function(callback, audio, video) {
        if (this.localMedia) {
            if (this.audioTry) {
                this.audio = audio;
                this.localMedia.getAudioTracks()[0].enabled = audio;
            }

            if (this.videoTry) {
                this.video = video;
                this.localMedia.getVideoTracks()[0].enabled = video;
            }

            if ((!video || this.videoTry) && (!audio || this.audioTry)) {
                callback(false);
                return;
            }
        }

        if (!audio && !video) {
            callback(false);
            return;
        }

        navigator.getUserMedia({'audio': audio || this.audioTry, 'video': video || this.videoTry},
            (function(self) {
                return function(stream) {
                    console.log("Access granted to audio/video");
                    self.localMedia = stream;

                    if (self.localMedia.getAudioTracks().length) {
                        self.audio = audio;
                        self.audioTry = true;

                        self.localMedia.getAudioTracks()[0].enabled = audio;
                    }

                    if (self.localMedia.getVideoTracks().length) {
                        self.video = video;
                        self.videoTry = true;

                        self.localMedia.getVideoTracks()[0].enabled = video;
                    }

                    self.updateLocalStreamCallback(self.localMedia, self.audio, self.video);
                    callback(true);
                }
            })(this),
            (function(self) {
                return function() {
                    if (audio) {
                        self.setupLocalMedia(callback, false, video);
                    } else if (video) {
                        self.setupLocalMedia(callback, audio, false);
                    } else {
                        console.log("Access denied for audio/video");
                        callback(true);
                    }
                }
            })(this));
    }

    this.__createOffer = function(socketID, audio, video) {
        console.log('Creating RTC offer to ', socketID);

        this.peers[socketID].createOffer(
            (function(self, socketID) {
                return function (localDescription) {
                    console.log('Local offer description is: ', localDescription);
                    self.peers[socketID].setLocalDescription(localDescription,
                        function() {
                            self.socket.emit('session_description-relay',
                                {'socket_id': socketID, 'session_description': localDescription});

                            console.log('Offer setLocalDescription succeeded');
                        },
                        function() { console.log('Offer setLocalDescription failed!'); }
                    );
                }
            })(this, socketID),
            (function(self, socketID) {
                return function (error) {
                    console.log('Error sending offer: ', error);
                }
            })(this, socketID),
            {
                'optional': [],
                'mandatory': {
                    'OfferToReceiveAudio': audio,
                    'OfferToReceiveVideo': video
                }
            }
        );
    }

    this.__onICECandidate = function(self, socketID) {
        return function(event) {
            if (event.candidate) {
                self.socket.emit('ice_candidate-relay', {
                    'socket_id': socketID,
                    'ice_candidate': {
                        'sdpMLineIndex': event.candidate.sdpMLineIndex,
                        'candidate': event.candidate.candidate
                    }
                });
            }
        }
    }

    this.__onAddStream = function(self, socketID) {
        return function(event) {
            self.streams[socketID] = event.stream;
            self.updateRemoteStreamCallback(event.stream, socketID);
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

    this.__pre_config = function() {
        if (navigator.mozGetUserMedia) {
          navigator.RTCPeerConnection = mozRTCPeerConnection;
          navigator.RTCSessionDescription = mozRTCSessionDescription;
          navigator.RTCIceCandidate = mozRTCIceCandidate;
          navigator.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
          navigator.attachMediaStream = function(element, stream) {
            console.log("Attaching media stream");
            element.mozSrcObject = stream;
            element.play();
          };
        } else if (navigator.webkitGetUserMedia) {
          navigator.RTCPeerConnection = webkitRTCPeerConnection;
          navigator.RTCSessionDescription = RTCSessionDescription;
          navigator.RTCIceCandidate = RTCIceCandidate;
          navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
          navigator.attachMediaStream = function(element, stream) {
            element.src = webkitURL.createObjectURL(stream);
          };

          if (!webkitMediaStream.prototype.getVideoTracks) {
              webkitMediaStream.prototype.getVideoTracks = function() {
              return this.videoTracks;
            }
          }

          if (!webkitMediaStream.prototype.getAudioTracks) {
              webkitMediaStream.prototype.getAudioTracks = function() {
              return this.audioTracks;
            }
          }
        } else {
          this.webRTCSupport = false;
          this.webRTCNotSupportedCallback();
        }

        ion.sound({
          sounds: [
            {name: "button_click"}
          ],

          path: "/scripts/lib/sounds/",
          preload: true,
          multiplay: true,
          volume: 0.3
        });
    }

    this.roomFullCallback = function() {};
    this.webRTCNotSupportedCallback = function() {};

    this.userInitializedCallback = function() {};

    this.participantLeftCallback = function() {};
    this.participantAddCallback = function() {};

    this.chatMessageCallback = function(data) {};
    this.updateLocalStreamCallback = function(stream, audio, video) {};
    this.updateRemoteStreamCallback = function(stream) {};

    this.connectionClosedCallback = function(peer_id) {};
}