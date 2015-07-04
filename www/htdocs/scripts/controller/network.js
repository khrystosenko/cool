(function() {

	var DEBUG = false;
	var DEFAULT = {
		MEDIA: {
			audio: true,
			video: true
		},
		ROOM: {
			LIMIT: 10
		},
		SERVER: {
			USERNAME: 'SERVER'
		}
	};

	var MEDIA = {
		AUDIO: {
			THRESHOLD: 30,
			VOLUME: 30
		},
		VIDEO: {
			RESOLUTION: 'lowres'
		}
	};

	var CHAT = {
		TYPING: {
			FADE_TIME: 150,
			TIMER_TIME: 400
		},
		COLORS: [
			'#e21400', '#91580f', '#f8a700', '#f78b00',
	        '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
	        '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	    ]
	};

	var HOST = 'http://185.65.245.105'; //window.location.origin;
	var SECURE = window.location.protocol == 'https:'


	var MCU = {
		host: HOST.split(':')[0] + ':' + HOST.split(':')[1],
		port: SECURE ? 8089 : 8088,
		slug: '/janus'
	};

	var ICE = {
		SERVERS: [
			{
	          'url': 'stun:stun.l.google.com:19302'
	        },
	        {
	          'url': 'turn:185.65.245.105:3478',
	          'username': 'test',
	          'credential': '1234'
	        }
	    ]
	}

	window.Sockets = {};

	var $window = $(window),
		$usernameInput = $('.usernameInput'),
		$currentInput = $usernameInput.focus();

	var local = {};
	var feeds = [];
	var janus;


	Sockets.connectSocket = function() {

		Janus.init({debug: DEBUG, callback: function() {
			var server = MCU.host + ':' + MCU.port + MCU.slug;
			$(document).ready(function() {
				$('#toggle_video').on('click', function() {
					if (local.stream.getVideoTracks()[0]){
						local.stream.getVideoTracks()[0].enabled = !local.stream.getVideoTracks()[0].enabled;
					}
					if (local.stream.getVideoTracks()[0].enabled) {
						$('.myvideo').removeClass('hideVideo');
						$('.videoImg').hide();
						$('.novideoImg').show();
					}
					else {
						$('.myvideo').addClass('hideVideo');
						$('.videoImg').show();
						$('.novideoImg').hide();
					}
				});
				$('#toggle_audio').on('click', function() {
					if (local.stream.getAudioTracks()[0]){
						local.stream.getAudioTracks()[0].enabled = !local.stream.getAudioTracks()[0].enabled;
					}
					if (local.stream.getAudioTracks()[0].enabled) {
						$('.myvideo').removeClass('hideAudio');
						$('.audioImg').hide();
						$('.noaudioImg').show();
					}
					else {
						$('.myvideo').addClass('hideAudio');
						$('.audioImg').show();
						$('.noaudioImg').hide();
					}
				});
				
			});

			$window.keydown(function(event) {
	            if (!(event.ctrlKey || event.metaKey || event.altKey)) {
	                $currentInput.focus();
	            }
	            
	            if (event.which === 13) {
	                if (local.username) {
	                	sendMessage();
	                } else {
	                    setUsername(function() {
	                    	if (!Janus.isWebrtcSupported()) {
	                    		console.log('WebRTC is not supported.');
	                    		return;
	                    	}

	                    	janus = new Janus({
	                    		server: server,
	                    		iceServers: ICE.SERVERS,
	                    		success: function() {
	                    			janus.attach({
	                    				plugin: 'janus.plugin.videoroom',
	                    				success: janusSuccessCallback,
	                    				error: janusErrorCallback,
	                    				onmessage: janusMessageCallback,
	                    				onlocalstream: janusLocalStreamCallback,
	                    				ondataopen: janusOnDataOpenCallback,
	                    				ondata: janusOnDataCallback,
	                    			});
	                    		},
	                    		error: function(error) {console.log(error)},
	                    		destroyed: function() {}
	                    	});
	                    });
	                }
	            }
	        });
		}});      
    }

    /* Janus callbacks - start */

    function janusSuccessCallback(pluginHandle) {
    	local.handle = pluginHandle;
    	local.handle.send({
    		message: {
    			request: 'exists',
    			room: ROOM_ID
    		},
    		success: function(data) {
    			if (data.exists == 'false') {
    				local.handle.send({
    					message: {
    						request: 'create',
    						room: ROOM_ID,
    						participants: DEFAULT.ROOM.LIMIT,
    						publishers: DEFAULT.ROOM.LIMIT
    					},
    					success: function(data) {
    						joinRoomCallback();
    					}
    				});
    			} else {
    				joinRoomCallback();
    			}
    		}
    	});
    }

    function janusErrorCallback(error) {

    }

    function janusMessageCallback(msg, jsep) {
		console.log(' ::: Got a message (publisher) :::');
		console.log(JSON.stringify(msg));
		var event = msg['videoroom'];
		console.log('Event: ' + event);
		if (event != null && event != undefined) {
			if (event === 'joined') {
				local.id = msg['id'];
				console.log('Successfully joined room ' + msg['room'] + ' with ID ' + local.id);
				publishOwnFeed(DEFAULT.MEDIA.audio, DEFAULT.MEDIA.video, true);
				if(msg['publishers'] !== undefined && msg['publishers'] !== null) {
					var list = msg['publishers'];
					console.log('Got a list of available publishers/feeds:');
					console.log(list);
					if (list.length == DEFAULT.ROOM.LIMIT) {
						alert('You can\' join this room because it is already full.');
						window.location.href = '/room/create/'
					}
					for(var f in list) {
						var id = list[f]['id'];
						var display = list[f]['display'];
						console.log('  >> [' + id + '] ' + display);
						newRemoteFeed(id, display)
					}
				}
			} else if (event === 'destroyed') {
				console.log('The room has been destroyed!');
				window.location.reload();
			} else if (event === 'event') {
				if (msg['publishers'] !== undefined && msg['publishers'] !== null) {
					var list = msg['publishers'];
					for(var f in list) {
						var id = list[f]['id'];
						var display = list[f]['display'];
						console.log('  >> [' + id + '] ' + display);
						newRemoteFeed(id, display);
					}
				} else if (msg['leaving'] !== undefined && msg['leaving'] !== null) {
					var leaving = msg["leaving"];
					console.log("Publisher left: " + leaving);
					var remoteFeed = null;
					for(var i=1; i < DEFAULT.ROOM.LIMIT; i++) {
						if(feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == leaving) {
							remoteFeed = feeds[i];
							break;
						}
					}
					if(remoteFeed != null) {
						console.log("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
						$('#media_' + remoteFeed.rfid).remove();
						feeds[remoteFeed.rfindex] = null;
						remoteFeed.detach();
					}
				} else if (msg['unpublished'] !== undefined && msg['unpublished'] !== null) {
					var unpublished = msg["unpublished"];
					console.log("Publisher left: " + unpublished);
					var remoteFeed = null;
					for (var i=1; i < DEFAULT.ROOM.LIMIT; i++) {
						if (feeds[i] != null && feeds[i] != undefined && feeds[i].rfid == unpublished) {
							remoteFeed = feeds[i];
							break;
						}
					}
					if (remoteFeed != null) {
						console.log("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching");
						$('#media_' + remoteFeed.rfid).remove();
						feeds[remoteFeed.rfindex] = null;
						remoteFeed.detach();
					}
				} else if (msg['error'] !== undefined && msg['error'] !== null) {
					console.log(msg['error'])
				}
			}
		}
		if(jsep !== undefined && jsep !== null) {
			local.handle.handleRemoteJsep({jsep: jsep});
		}
    }

    function janusLocalStreamCallback(stream) {
    	local.stream = stream;
    	if ($('#media_' + local.id).length === 0) {
    		var media_tag = $('<video class="videostyle myvideo" width="120" height="120">');
    		media_tag.attr('autoplay', 'autoplay');
    		media_tag.attr('id', 'media_' + local.id);
    		media_tag.attr('muted', true);
    		$('#myvideoLook').append(media_tag);
    	} else {
    		var media_tag = $('#media_' + local.id);
    	}
    	attachMediaStream(media_tag[0], stream);
    }

    function janusOnDataOpenCallback(data) {
    	console.log('OnDataOpenCallback', data);
    }

    function janusOnDataCallback(data) {
    	console.log('OnDataOpenCallback', data);
    }

    /* Janus callbacks - end */

    function joinRoomCallback() {
		local.handle.send({
			message: {
				request: 'join',
				room: ROOM_ID,
				ptype: 'publisher',
				display: local.username
			}
		});
    }

    function publishOwnFeed(audio, video, data) {
    	local.handle.createOffer({
    		media: {
    			audioRecv: false,
    			videoRecv: false,
    			audio: audio,
    			video: video ? 'lowres' : false,
    			data: data
    		}, success: function(jsep) {
				console.log('Got publisher SDP!');
				console.log(jsep);
				var publish = {
					request: 'configure', 
					audio: audio, 
					video: video,
    				data: data
				};
				local.handle.send({'message': publish, 'jsep': jsep});
    		}, error: function(error) {
    			if (video) {
    				publishOwnFeed(audio, false, true);
    			} else if (audio) {
    				publishOwnFeed(false, video, true);
    			} else if (data) {
    				publishOwnFeed(false, false, data);
    			} else {
    				console.log('WebRTC error occured', error);
    			}
    		}
    	});
    }

    function newRemoteFeed(id, display) {
    	var remoteFeed;
    	janus.attach({
    		plugin: 'janus.plugin.videoroom',
    		success: function(pluginHandle) {
    			remoteFeed = pluginHandle;
    			remoteFeed.send({
    				message: {
    					request: 'join',
    					room: ROOM_ID,
    					ptype: 'listener',
    					feed: id
    				}
    			});
    		},
    		error: function(error) {

    		},
    		onmessage: function(msg, jsep) {
    			var event = msg['videoroom'];
    			if (event != undefined && event != null) {
    				if (event === 'attached') {
    					for (var i = 1; i < DEFAULT.ROOM.LIMIT; i++) {
    						if (feeds[i] === undefined || feeds[i] === null) {
    							feeds[i] = remoteFeed;
    							remoteFeed.rfindex = i;
    							break;
    						}
    					}
    					remoteFeed.rfid = msg['id'];
						remoteFeed.rfdisplay = msg['display'];
    				} else {

    				}
    			}
				if (jsep !== undefined && jsep !== null) {
					remoteFeed.createAnswer({
						jsep: jsep,
						media: { audioSend: false, videoSend: false, data: true},
						success: function(jsep) {
							var body = { "request": "start", "room": ROOM_ID };
							remoteFeed.send({"message": body, "jsep": jsep});
						},
						error: function(error) {
							console.log("WebRTC error:");
							console.log(error);
						}
					});
				}
    		},
    		onremotestream: function(stream) {
		    	if ($('#media_' + remoteFeed.rfid).length === 0) {
		    		var wrapper = $('<div>');
		    		wrapper.attr('id', 'media_' + remoteFeed.rfid);
		    		$('#audio_chat').append(wrapper);

		    		var media_tag = $('<video class="videostyle" width="120" height="120">');
		    		media_tag.attr('autoplay', 'autoplay');
		    		wrapper.append(media_tag);

		    		var controller = $('<div>');
		    		wrapper.append(controller);

		    		var volume = $('<input>');
		    		volume.attr('type', 'range');
		    		volume.css({
		    			width: '120px'
		    		});

		    		volume.on('change', function() { 
		    			console.log(this.value / 100.0);
		    			media_tag[0].volume = this.value / 100.0;
		    		});

		    		volume[0].value = MEDIA.AUDIO.VOLUME;

		    		controller.append(volume);

		    	} else {
		    		var media_tag = $('#media_' + remoteFeed.rfid + ' video');
		    	}
		    	attachMediaStream(media_tag[0], stream);
    		},
    		ondata: function(data) {
    			addChatMessage({
    				message: data,
    				username: remoteFeed.rfdisplay
    			});
    		}
    	});
    }

    function sendMessage() {
        var message = $('.inputMessage').val();
        // Prevent markup from being injected into the message
        message = cleanInput(message);
        // if there is a non-empty message and a socket connection
        if (message) {
            local.handle.data({
            	text: message,
            	success: function() { 
            		addChatMessage({
            			message: message,
            			username: local.username
            		}); 
            		$('.inputMessage').val('');
            	}
            })
        }
    }

    function setUsername(callback) {
        username = cleanInput($('.usernameInput').val().trim());

        if (username) {
            $('.login.page').fadeOut();
            $('.chat.page').show();
            $('.login.page').off('click');
            $currentInput = $('.inputMessage').focus();
            local.username = username;
            callback();
        }
    }

    function cleanInput(input) {
        return $('<div/>').text(input).text();
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
            $el.hide().fadeIn(CHAT.TYPING.FADE_TIME);
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
        var index = Math.abs(hash % CHAT.COLORS.length);
        return CHAT.COLORS[index];
    }

})();