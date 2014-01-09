/**
 * Created by hoangnn on 1/9/14.
 */
var dispatcher = require('../../../util/dispatcher')
module.exports = function (app) {
    return new Handler(app)
}

Handler = function (app) {
    this.app = app
}

handler = Handler.prototype

/**
 * ham nay tra ve du lieu connector
 **/

handler.queryEntry = function (message, session, next) {
    var uui = message.uid;
    if (!uui) {
        next(null, {
            code: 500,
            msg: "UUI not exits"
        });
        return;
    }

    var connectors = this.app.getServersByType('connector');
    if (!connectors || connectors.length === 0) {
        next(null, {
            code: 500,
            msg: "Connector not found"
        });
        return
    }
    var res = dispatcher.dispatch(uui, connectors);
    next(null, {
        code: 200,
        host: res.host,
        port: res.clientPort
    });
}
