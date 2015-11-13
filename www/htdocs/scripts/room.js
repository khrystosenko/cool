var handler;
$(document).ready(function() {
    handler = new NetworkHandler(ROOM_UUID, SIGNALING_SERVER.HOST, SIGNALING_SERVER.PORT);

    handler.chatMessageCallback = function(data) {
        $('#chat_content').append('<p>' + data.username + ' said: ' + data.message + '</p>');
    }

    handler.roomFullCallback = function() {
        alert('This room is already full');
    }

    handler.webRTCNotSupportedCallback = function() {
        alert('WebRTC is not supported by your browser.')
    }

    handler.updateLocalStreamCallback = function(stream, audio, video) {
        var mic, camera;
        if (audio) {
            mic = $('<span>Turn off mic</span>');
            mic.click(function() {handler.toggleLocalStream(false, video)});
        } else {
            mic = $('<span>Turn on mic</span>')
            mic.click(function() {handler.toggleLocalStream(true, video)});;
        }


        if (video) {
            camera = $('<span>Turn off video</span>');
            camera.click(function() {handler.toggleLocalStream(audio, false)});
        } else {
            camera = $('<span>Turn on video</span>')
            camera.click(function() {handler.toggleLocalStream(audio, true)});;
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
            $('#roommates_content').append(wrapper);

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