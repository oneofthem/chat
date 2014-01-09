/**
 * Created by hoangnn on 1/9/14.
 */
module.exports = function(app)
{
    return new Handler()
}

Handler = function(app){
    this.app = app
}

handler = Handler.prototype

handler.enter = function(msg, session, next)
{
    var self = this
    username = msg.username
    rid = msg.rid
    var uid = username+'*'+rid;
    var sessionService = self.app.get('sessionService');

    if(!!sessionService.getByUid(uid))
    {
        next(null,{
            code: 500,
            msg: 'already logged in',
            error: true
        });
        return
    }

    session.bind(uid);
    session.set('rid', rid);
    session.push('rid', function(err){
        if (err)
        {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });

    session.on('closed', onUserLeave.bind(null, self.app));

    //put user into channel
    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function(users){
        next(null, {
            users:users
        });
    });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};

