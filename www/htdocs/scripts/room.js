var handler;
var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824ee', '#a700ff', '#d300e7'
];
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

function updateParticipantMessage() {
    var msg = (handler.participants > 1 ? handler.participants - 1 : 'NO');
    msg += handler.participants - 1 == 1 ? ' ROOMMATE' : ' ROOMMATES';
    $('#roommates').text(msg);
}

$(document).ready(function() {
    $('#chat_content').perfectScrollbar();
    
    handler = new NetworkHandler(ROOM_UUID, SIGNALING_SERVER.HOST, SIGNALING_SERVER.PORT);

    handler.chatMessageCallback = function(data) {
        $('.img_nochat').hide();
        var message = $('<span>');
        message.append('<span class="chat-username" style="color: ' + getUsernameColor(data.username) + '">' + data.username + ':</span>');
        message.append('<span class="chat-message">' + data.message + '</span>');
        message.append('<br />');

        $('#chat_content').append(message);

        $('#chat_content').scrollTop($('#chat_content')[0].scrollHeight);
    }


    handler.roomFullCallback = function() {
        alert('This room is already full');
    }

    handler.webRTCNotSupportedCallback = function() {
        alert('WebRTC is not supported by your browser.')
    }

    handler.userInitializedCallback = function() {
        if (handler.emptyChat) {
            $('.img_nochat').show();
        }        
        updateParticipantMessage();
    };

    handler.participantLeftCallback = function() {
        updateParticipantMessage();
    };

    handler.participantAddCallback = function() {
        updateParticipantMessage();
    }

    handler.updateLocalStreamCallback = function(stream, audio, video) {
        var mic, camera;
        if (audio) {
            mic = $('<span class="voice"><img src="/img/voice_off.png" alt="Turn off mic" /></span>');
            mic.hover(function() {$( this ).append( $( '<span class="voice" style="left: 0;"><img src="/img/voice_off_hover.png" alt="Turn off mic" /></span>' ) );}, function() {$( this ).find( "span:last" ).remove();});
            mic.click(function() {handler.toggleLocalStream(false, video)});
        } else {
            mic = $('<span class="voice"><img src="/img/voice_on.png" alt="Turn on mic" /></span>')
            mic.hover(function() {$( this ).append( $( '<span class="voice" style="left: 0;"><img src="/img/voice_on_hover.png" alt="Turn off mic" /></span>' ) );}, function() {$( this ).find( "span:last" ).remove();});
            mic.click(function() {handler.toggleLocalStream(true, video)});
        }


        if (video) {
            camera = $('<span class="video"><img src="/img/camera_off.png" alt="Turn off video" /></span>');
            camera.hover(function() {$( this ).append( $( '<span class="video" style="left: 0;top: 0;"><img src="/img/camera_off_hover.png" alt="Turn off mic" /></span>' ) );}, function() {$( this ).find( "span:last" ).remove();});
            camera.click(function() {handler.toggleLocalStream(audio, false)});
        } else {
            camera = $('<span class="video"><img src="/img/camera_on.png" alt="Turn on video"</span>');
            camera.hover(function() {$( this ).append( $( '<span class="video" style="left: 0;top: 0;"><img src="/img/camera_on_hover.png" alt="Turn off mic" /></span>' ) );}, function() {$( this ).find( "span:last" ).remove();});
            camera.click(function() {handler.toggleLocalStream(audio, true)});
        }

        $('#local_stream_controls').html('');
        $('#local_stream_controls').append(mic);
        $('#local_stream_controls').append(camera);


        var localStream = $('#local_stream video');
        localStream.attr('poster', noCameraSrc);

        if (navigator.webkitGetUserMedia) {
          localStream.attr('src', window.URL.createObjectURL(stream));
        } else {
          localStream.attr('src', stream);
        }

    };

    handler.updateRemoteStreamCallback = function(stream, peer_id) {
        var streamID = 'stream_' + peer_id;
        var newStream = $('#' + streamID).length == 0;
        var mediaTag;
        if (newStream) {
            var wrapper = $('<div>', {
                id: 'stream_' + peer_id,
                class: 'stream'
            });
            $('#room_control').append(wrapper);
            mediaTag = $('<video width="60" height="60">');
            mediaTag.attr('id', peer_id);
            mediaTag.attr('autoplay', 'autoplay');
            mediaTag.attr('poster', noCameraSrc);
            wrapper.append(mediaTag);
        } else {
            mediaTag = $('#' + streamID + ' video');
        }


        if (navigator.webkitGetUserMedia) {
            mediaTag.attr('src', window.URL.createObjectURL(stream));
        } else {
            mediaTag.attr('src', stream);
        }
    }

    handler.connectionClosedCallback = function(peer_id) {
        $('#stream_' + peer_id).remove();
    }


    $('#username_input input').keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            $('#username_input .submit').click();
        }
    });

    $('#message_input input').keypress(function(e) {
        if(e.which == 13) {
            e.preventDefault();
            $('#message_input .submit').click();
        }
    });

    $('#username_input .submit').click(function() {
        var username = $('#username_input input').val().trim();
        if (username === '') {
          return;
        }

        $('#username_input').hide();
        $('#message_input').show();

        handler.setUsername(username);
    });

    $('#message_input .submit').click(function() {
        var msg = $('#message_input input').val().trim();
        if (msg === '') {
          return;
        }

        $('#message_input input').val('');

        handler.sendChatMessage(msg);
    });


    handler.init();
});


