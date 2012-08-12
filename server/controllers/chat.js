
/**
 * 聊天主界面
 */
exports.index = function(req, res){
  res.render('chat.jade');
};

/**
 * 初始化ChatServer
 */
exports.init = function(io, app, sessionStore){
  var chatServer = io.of('/chat');
  var userList = {};

  chatServer.authorization(function (handshakeData, callback) {
      //没有cookie则退出
      if (!handshakeData.headers.cookie) return callback('socket.io: no found cookie.', false);

      //根据cookie找sessionId,https://github.com/DanielBaulig/sioe-demo/blob/master/app.js
      var signedCookies = require('express/node_modules/cookie').parse(handshakeData.headers.cookie);
      handshakeData.cookies = require('express/node_modules/connect/lib/utils').parseSignedCookies(signedCookies, app.get('config')['session_secret']);

      //根据sessionId找username
      sessionStore.get(handshakeData.cookies['sid'], function(err,session){
        if(err || !session) return callback('socket.io: no found session.', false);
        handshakeData.session = session;
        if(handshakeData.session.user){ 
          return callback(null, true);
        }else{
          return callback('socket.io: no found session.user', false);
        }
      })
  });

  chatServer.on('connection', function (client) {
    //用户登录,保存信息
    var username = client.handshake.session.user.username;
    userList[username] = client;

    //通知客户端刷新在线用户
    var refreshOnline = function(){
      var arr = [];
      for(var name in userList){
        arr.push({
          username: name
        });
      }
      chatServer.emit('onlinelist', arr);
    }
    refreshOnline();
    client.broadcast.emit('join',username);

    //消息
    client.on('talk',function(msg, callback){
      client.broadcast.emit('talk', msg, username);
      callback && callback(true);
    });

    //私聊
    client.on('whisper',function(msg, targetUser, callback){
      var target = userList[targetUser];
      if(target){
        target.emit('whisper', msg, username);
        callback && callback(true);
      }else{
        client.emit('nofound', msg, targetUser, '用户不在线.');
        callback && callback(false);
      }
    });

    //掉线
    client.on('disconnect', function(){
      refreshOnline();
      client.broadcast.emit('leave',username);
      delete userList[username] ;
      client.handshake.session = null;
    });
  });
  console.log('Chat Server init.');
}