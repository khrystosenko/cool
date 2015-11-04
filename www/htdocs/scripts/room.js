function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var peers = {};

$(document).ready(function() {
    var peer = new Peer('room-id_' + makeid(), {
        host: SIGNALING_SERVER.HOST, 
        port: SIGNALING_SERVER.PORT, 
        path: SIGNALING_SERVER.PATH
    });

    peer.on('error', function(error) {
        if (error.code) {
            console.log('Error code:', error.code);
        } else {
            console.log(error);
        }
    });

    peer.on('open', function(id, data) {
        for (var i in data.room) {
            var peer_id = data.room[i];
            if (peer_id == id) {
                continue;
            }

            peers[peer_id] = peer.connect(peer_id);

            peers[peer_id].on('open', function (peer_id) {
                return function() {
                    peers[peer_id].send('Hello ' + peer_id);
                }   
            }(peer_id));
        }
    });

    peer.on('connection', function(conn) {
        console.log('New connection', conn);

        conn.on('data', function(data) {
            console.log(data);
        });
    });

});