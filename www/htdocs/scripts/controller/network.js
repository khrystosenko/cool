
(function() {

    window.Sockets = {};

    var transport;
    var network = {
        send: send
    };

    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];

    var ICE_SERVERS = [
        {
            url: 'stun:stun.l.google.com:19302'
        }
    ];

    if (navigator.mozGetUserMedia) {
      navigator.RTCPeerConnection = mozRTCPeerConnection;
      navigator.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
      navigator.attachMediaStream = function(element, stream) {
        console.log("Attaching media stream");
        element.mozSrcObject = stream;
        element.play();
      };
    } else if (navigator.webkitGetUserMedia) {
      navigator.RTCPeerConnection = webkitRTCPeerConnection;
      navigator.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
      navigator.attachMediaStream = function(element, stream) {
        element.src = webkitURL.createObjectURL(stream);
      };

      // The representation of tracks in a stream is changed in M26.
      // Unify them for earlier Chrome versions in the coexisting period.
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
      console.log("Browser does not appear to be WebRTC-capable");
    }


    // Initialize varibles
    var localMediaStream = null;
    var peers = {};
    var peerMediaElemenets = {};
    var audioChatID = 'audio_chat';

    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page

    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();

    var HOST = window.location.origin;

    Object.defineProperty(network, 'transport', {
        get: function() {
            return transport;
        }
    });

    var host = HOST.split(':')[0] + ':' + HOST.split(':')[1];
    var port = 8888;

    Sockets.connectSocket = function() {

        transport = io.connect(host + ':' + port);

        transport.on('connect', function() {
            console.log('Socket connected.');
        });

        transport.on('disconnect', function() {
            console.log('Socket disconnected.');

            for (socket_id in peerMediaElemenets) {
                peerMediaElemenets[socket_id].remove();
            }

            for (socket_id in peers) {
                peers[socket_id].close();
            }

            peers = {};
            peerMediaElemenets = {};
        });

        transport.on('login', function(data) {
            connected = true;

            $('.inputMessage').on('input', function() {
                updateTyping(transport);
            });

        });

        transport.on('user-joined', function(data) {
            log(data.username + ' joined');
            addParticipantsMessage(data);
        });

        transport.on('user-left', function(data) {
            addParticipantsMessage(data);
        });

        transport.on('chat-update', function(data) {
            addChatMessage(data);
        });

        transport.on('typing', function(data) {
            addChatTyping(data);
        });

        transport.on('typing-stop', function(data) {
            removeChatTyping(data);
        });

        transport.on('peer-add', function(data) {
            console.log('Signaling server said to add peer:', data);

            var socket_id = data.socket_id;
            if (socket_id in peers) {
                console.log('Already connected to peer ', socket_id);
                return;
            }

            var peer_connection = new navigator.RTCPeerConnection(
                {iceServers: ICE_SERVERS},
                {optional: [{DtlsSrtpKeyAgreement: true}]}
            );

            peers[socket_id] = peer_connection;

            peer_connection.onicecandidate = function(event) {
                if (event.candidate) {
                    transport.emit('ice_candidate-relay', {
                        'socket_id': socket_id, 
                        'ice_candidate': {
                            'sdpMLineIndex': event.candidate.sdpMLineIndex,
                            'candidate': event.candidate.candidate
                        }
                    });
                }
            }

            peer_connection.onaddstream = function(event) {
                console.log('onAddStream', event);

                var remote_media = $('<audio>');
                remote_media.attr('autoplay', 'autoplay');
                remote_media.attr('muted', 'false');
                remote_media.attr('controls', '');
                peerMediaElemenets[socket_id] = remote_media;
                $('#' + audioChatID).append(remote_media);
                navigator.attachMediaStream(remote_media[0], event.stream);
            }

            if (localMediaStream) {
                peer_connection.addStream(localMediaStream);
            }

            if (data.create_offer) {
                console.log('Creating RTC offer to ', socket_id);

                peer_connection.createOffer(
                    function (local_description) { 
                        console.log('Local offer description is: ', local_description);
                        peer_connection.setLocalDescription(local_description,
                            function() { 
                                transport.emit('session_description-relay', 
                                    {'socket_id': socket_id, 'session_description': local_description});

                                console.log('Offer setLocalDescription succeeded'); 
                            },
                            function() { alert('Offer setLocalDescription failed!'); }
                        );
                    },
                    function (error) {
                        console.log('Error sending offer: ', error);
                    });
            }
        });

        transport.on('session_description', function(data) {
            console.log('Remote description received: ', data);
            var socket_id = data.socket_id;
            var peer = peers[socket_id];
            var remote_description = data.session_description;
            console.log(data.session_description);

            var desc = new RTCSessionDescription(remote_description);
            var stuff = peer.setRemoteDescription(desc, 
                function() {
                    console.log('setRemoteDescription succeeded');
                    if (remote_description.type == "offer") {
                        console.log("Creating answer");
                        peer.createAnswer(
                            function(local_description) {
                                console.log('Answer description is: ', local_description);
                                peer.setLocalDescription(local_description,
                                    function() { 
                                        transport.emit('session_description-relay', 
                                            {'socket_id': socket_id, 'session_description': local_description});
                                        console.log('Answer setLocalDescription succeeded');
                                    },
                                    function() { alert('Answer setLocalDescription failed!'); }
                                );
                            },
                            function(error) {
                                console.log('Error creating answer: ', error);
                                console.log(peer);
                            });
                    }
                },
                function(error) {
                    console.log('setRemoteDescription error: ', error);
                }
            );
            console.log('Description Object: ', desc);
        });

        transport.on('ice_candidate', function(data) {
            var peer = peers[data.socket_id];
            var ice_candidate = data.ice_candidate;
            peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
        });

        transport.on('peer-remove', function(data) {
            console.log('Signaling server said to remove peer:', data);
            var socket_id = data.socket_id;
            if (socket_id in peerMediaElemenets) {
                peerMediaElemenets[socket_id].remove();
            }
            if (socket_id in peers) {
                peers[socket_id].close();
            }

            delete peers[socket_id];
            delete peerMediaElemenets[data.socket_id];
        });

        $window.keydown(function(event) {
            // Auto-focus the current input when a key is typed
            if (!(event.ctrlKey || event.metaKey || event.altKey)) {
                $currentInput.focus();
            }
            // When the client hits ENTER on their keyboard
            if (event.which === 13) {
                if (username) {
                    sendMessage();
                    transport.emit('typing-stop');
                    typing = false;
                } else {
                    setUsername();
                }
            }
        });

    }

    function setup_local_media(callback, errorback) {
        if (localMediaStream != null) {  /* ie, if we've already been initialized */
            if (callback) callback();
            return;
        }
        navigator.getUserMedia({'audio': true},
            function(stream) { /* user accepted access to a/v */
                console.log("Access granted to audio/video");
                localMediaStream = stream;
                var local_media = $('<audio>');
                local_media.attr('autoplay', 'autoplay');
                local_media.attr('muted', 'true'); /* always mute ourselves by default */
                local_media.attr('controls', '');
                $('#' + audioChatID).append(local_media);
                navigator.attachMediaStream(local_media[0], stream);
                if (callback) callback();
            },
            function() { /* user denied access to a/v */
                console.log("Access denied for audio/video");
                if (callback) callback();
            });
    }


    function cleanInput(input) {
        return $('<div/>').text(input).text();
    }

    function addParticipantsMessage(data) {
        var message = '';
        if (data.numUsers === 1) {
            message += "there's 1 participant";
        } else {
            message += "there are " + data.numUsers + " participants";
        }
        log(message);
    }

    function setUsername() {
        username = cleanInput($('.usernameInput').val().trim());

        // If the username is valid
        if (username) {
            $('.login.page').fadeOut();
            $('.chat.page').show();
            $('.login.page').off('click');
            $currentInput = $('.inputMessage').focus();

            setup_local_media(function() {
                transport.emit('initialize', username, ROOM_UUID);
            });
        }
    }

    function send(type, data, fn) {
        transport.emit(type, data, fn);
    }

    function sendMessage() {
        var message = $('.inputMessage').val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message && connected) {
            $('.inputMessage').val('');
            transport.emit('chat-send', message);
        }
    }

    function log(message, options) {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
    }

    function addChatMessage(data, options) {
        // Don't fade the message in if there is an 'X was typing'
        var $typingMessages = getTypingMessages(data);
        options = options || {};
        if ($typingMessages.length !== 0) {
            options.fade = false;
            $typingMessages.remove();
        }

        var $usernameDiv = $('<span class="username"/>')
            .text(data.username)
            .css('color', getUsernameColor(data.username));
        var $messageBodyDiv = $('<span class="messageBody">')
            .text(data.message);

        var typingClass = data.typing ? 'typing' : '';
        var $messageDiv = $('<li class="message"/>')
            .data('username', data.username)
            .addClass(typingClass)
            .append($usernameDiv, $messageBodyDiv);

        addMessageElement($messageDiv, options);
    }

    // Adds the visual chat typing message
    function addChatTyping(data) {
        data.typing = true;
        data.message = 'is typing';
        addChatMessage(data);
    }

    // Removes the visual chat typing message
    function removeChatTyping(data) {
        getTypingMessages(data).fadeOut(function() {
            $(this).remove();
        });
    }

    function addMessageElement(el, options) {
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(FADE_TIME);
        }
        if (options.prepend) {
            $('.messages').prepend($el);
        } else {
            $('.messages').append($el);
        }
        $('.messages')[0].scrollTop = $('.messages')[0].scrollHeight;
    }

    function getTypingMessages(data) {
        return $('.typing.message').filter(function(i) {
            return $(this).data('username') === data.username;
        });
    }

    function getUsernameColor(username) {
        // Compute hash code
        var hash = 7;
        for (var i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + (hash << 5) - hash;
        }
        // Calculate color
        var index = Math.abs(hash % COLORS.length);
        return COLORS[index];
    }

    function updateTyping(socket) {
        if (connected) {
            if (!typing) {
                typing = true;
                socket.emit('typing');
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(function() {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                    socket.emit('typing-stop');
                    typing = false;
                }
            }, TYPING_TIMER_LENGTH);
        }
    }

    window.network = network;

}());
