var pomelo = require('pomelo');
var dispatcher = require('./app/util/dispatcher');
var abuseFilter = require('./app/servers/chat/filter/abuseFilter');

// route definition for chat server
var chatRoute = function (session, msg, app, cb) {
    var chatServers = app.getServersByType('chat');

    if (!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }

    var res = dispatcher.dispatch(session.get('rid'), chatServers);

    cb(null, res.id);
};

// route for time server

var timeRoute = function (routeParam, msg, app, cb) {
    var timeServers = app.getServersByType('time');
    console.log('Port: ' + routeParam.port);
    cb(null, timeServers[routeParam.number % timeServers.length].id);
}

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo-websocket');

// app configuration
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            heartbeat: 3,

            // enable useDict will make route to be compressed
            useDict: true,

            // enable useProto
            useProtobuf: true
        });
});

app.configure('production|development', 'gate', function () {
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            useDict: true,

            // enable useProto
            useProtobuf: true
        });
});

// app configure
app.configure('production|development', function () {
    // route configures
    app.route('chat', chatRoute);
    app.route('time', timeRoute);
    app.filter(pomelo.timeout());
});

app.configure('production|development', 'chat', function () {
    app.filter(abuseFilter());
});

// start app
app.start();

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});
