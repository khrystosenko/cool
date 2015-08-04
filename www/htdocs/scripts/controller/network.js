
(function() {

    window.Sockets = {};

    var transport;
    var network = {
        send: send
    };

    var MIC_THRESHOLD = 30;
    var MIC_FADE = 150;
    var FADE_TIME = 150; // ms
    var TYPING_TIMER_LENGTH = 400; // ms
    var DEFAULT_AUDIO_VOLUME = 20;
    var COLORS = [
        '#e21400', '#91580f', '#f8a700', '#f78b00',
        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
    var turn_username = 'test',
        turn_password = '1234';

    var ICE_SERVERS = [
        {
          'url': 'stun:stun.l.google.com:19302'
        },
        {
          'url': 'turn:185.65.245.105:3478',
          'username': turn_username,
          'credential': turn_password
        },
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
    window.AudioContext = window.AudioContext || window.webkitAudioContext;


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

        transport.on('room-error', function(data) {
            alert(data.msg);
            window.location.href = '/room/create/';
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

        transport.on('mic-volume-update', function(data) {
            addUserMicVolume(data);
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

                var wrapper = $('<div>', {
                    id: 'stream_' + socket_id
                });
                $('#audio_chat').append(wrapper);

                var media_tag = $('<video class="videostyle" width="120" height="120">');
                media_tag.attr('autoplay', 'autoplay');
                wrapper.append(media_tag);

                var controller = $('<div>');
                wrapper.append(controller);
                wrapper.css({
                    margin: '5px'
                });

                var volume = $('<input>');
                volume.attr('type', 'range');
                volume.css({
                    width: '120px',
                    float: 'left'
                });

                volume.on('change', function() {
                    media_tag[0].volume = this.value / 100.0;
                });

                media_tag.on('click', function() {
                    if (media_tag.hasClass('largervideo')) {
                        media_tag.removeClass('largervideo')
                    } else {
                        media_tag.addClass('largervideo')

                    }
                });

                volume[0].value = DEFAULT_AUDIO_VOLUME;

                controller.append(volume);

                peerMediaElemenets[socket_id] = media_tag;
                navigator.attachMediaStream(media_tag[0], event.stream);
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
                    }, 
                    {
                        'optional': [],
                        'mandatory': {
                            'OfferToReceiveAudio': data.access_granted
                        }
                    });
            }
        });

        transport.on('session_description', function(data) {
            console.log('Remote description received: ', data);
            var socket_id = data.socket_id;
            var peer = peers[socket_id];
            var remote_description = data.session_description;
            console.log(remote_description);

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
                peerMediaElemenets[socket_id].parent().remove();
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

    function setup_local_media(callback, audio_level_callback) {
        if (localMediaStream != null) {  /* ie, if we've already been initialized */
            if (callback) callback();
            return;
        }
        navigator.getUserMedia({'audio': true, 'video': true},
            function(stream) { /* user accepted access to a/v */
                console.log("Access granted to audio/video");
                localMediaStream = stream;
                var local_media = $('<video class="videostyle myvideo" width="120" height="120">');
                local_media.attr('autoplay', 'autoplay');
                local_media.attr('muted', true); /* always mute ourselves by default */
                $('#myvideoLook').append(local_media);
                navigator.attachMediaStream(local_media[0], stream);

                // var audioContext = new webkitAudioContext(),
                //     analyser = audioContext.createAnalyser(),
                //     microphone = audioContext.createMediaStreamSource(stream),
                //     javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

                // analyser.smoothingTimeConstant = 0.3;
                // analyser.fftSize = 1024;

                // microphone.connect(analyser);
                // analyser.connect(javascriptNode);
                // javascriptNode.connect(audioContext.destination);

                // javascriptNode.onaudioprocess = function() {
                //     var array =  new Uint8Array(analyser.frequencyBinCount);
                //     analyser.getByteFrequencyData(array);
                //     var values = 0;

                //     var length = array.length;
                //     for (var i = 0; i < length; i++) {
                //         values += array[i];
                //     }

                //     var average = values / length;
                //     if (average > MIC_THRESHOLD) {
                //         audio_level_callback(average);
                //     }
                // }

                $('#toggle_video').on('click', function() {
                    if (localMediaStream.getVideoTracks()[0]) {
                        localMediaStream.getVideoTracks()[0].enabled = !localMediaStream.getVideoTracks()[0].enabled;
                    }
                    if (localMediaStream.getVideoTracks()[0].enabled) {
                        $('.myvideo').removeClass('hideVideo');
                        $('.videoImg').css({
                            'background-color': 'transparent'
                        });
                    } else {
                        $('.myvideo').addClass('hideVideo');
                        $('.videoImg').css({
                            'background-color': '#C94A29'
                        });
                    }
                });

                $('#toggle_audio').on('click', function() {
                    if (localMediaStream.getAudioTracks()[0]) {
                        localMediaStream.getAudioTracks()[0].enabled = !localMediaStream.getAudioTracks()[0].enabled;
                    }
                    if (localMediaStream.getAudioTracks()[0].enabled) {
                        $('.myvideo').removeClass('hideAudio');
                        $('.audioImg').css({
                            'background-color': 'transparent'
                        });
                    } else {
                        $('.myvideo').addClass('hideAudio');
                        $('.audioImg').css({
                            'background-color': '#C94A29'
                        });
                    }
                });

                $('.myvideo').on('click', function() {
                    if ($('video.myvideo').hasClass('largervideo')) {
                        $('video.myvideo').removeClass('largervideo')
                    } else {
                        $('video.myvideo').addClass('largervideo')

                    }
                });


                if (callback) callback(true);
            },
            function() { /* user denied access to a/v */
                console.log("Access denied for audio/video");
                if (callback) callback(false);
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

            setup_local_media(function(access_granted) {
                transport.emit('initialize', username, ROOM_ID, access_granted);
            }, function(volume) {
                transport.emit('mic-volume-update');
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

    function addUserMicVolume(data) {

    }

    window.network = network;

}());