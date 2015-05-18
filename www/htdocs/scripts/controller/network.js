(function() {

    window.Sockets = {};

    var transport;
    var network = {
        send: send
    };

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

            console.log('socket connected');

        });

    }

    function send(type, data, fn) {

        transport.emit(type, data, fn);

    }

    window.network = network;

}());
