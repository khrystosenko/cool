var handler;
$(document).ready(function() {
    handler = new PeerHandler('room_id');
    handler.init();

    handler.chatMessageCallback = function(data) {
        $('body').append('Peer #' + data.peer + ' said: ' + data.message);
    }

    handler.roomFullCallback = function() {
        alert('This room is already full');
    }

    handler.webRTCNotSupportedCallback = function() {
        alert('WebRTC is not supported by your browser.')
    }

    handler.updateLocalStreamCallback = function(stream, audio, video) {
        var localStream = $('#local_stream');
          if (navigator.webkitGetUserMedia) {
              localStream.attr('src', window.URL.createObjectURL(stream));
          } else {
              localStream.attr('src', stream);
          }
    };

    handler.updateRemoteStreamCallback = function(stream, peer_id) {
        console.log('New stream from ' + peer_id);
    }
});