var _ = require("underscore");

/**
 * 客户端管理主界面
 */
exports.index = function(req, res){
  res.render('remote.jade');
};

/**
 * 初始化RemoteServer
 */
exports.init = function(io, app, sessionStore){
  var remoteServer = io.of('/remote');
  var slaveList = {};
  var masterList = {};
  
  //接入认证
  remoteServer.authorization(function(handshakeData, callback){
    //接入者类型
    var clientType = handshakeData.query.clientType;
    switch(clientType){
      //主控端,需要校验是否登录
      case 'master':
        break;
      //被控端
      case 'slave':
        break;
      //未知
      default:
        return callback(null, false);
    }
    return callback(null, true);
  })

  //连接事件处理
  remoteServer.on('connection', function (client) {
    var clientData = client.handshake;
    var clientId = client.id;
    var clientType = clientData.query.clientType;

    console.log('%s(%s) connect...', clientType, clientId);

    var messageHandler;

    //处理被控端接入
    if(clientType=='slave'){
      slaveList[clientId] = client;
      client.join('room-' + clientId);
      messageHandler = slaveHandler;
      
      listFile(null,clientId,'.');
    }else{
      //处理主控端接入
      masterList[clientId] = client;
      messageHandler = masterHandler;
    }

    //注册事件
    client.on('message', function(data){
      if( _.isObject(data) && isSupportCommand(data.cmd,clientType)){
        data.clientType = clientType;
        messageHandler(client,data);
      }else{
        console.error('message format error, {cmd:"",params...}, but: %s',data);
      }
    });    
  });

  /**
   * 是否是支持的指令
   */
  var isSupportCommand = function(cmd,clientType){
    return _.include(['ls'],cmd);
  }

  /**
   * 处理slave发过来的msg
   */
  var slaveHandler = function(client,data){
    console.log('got message from slave(%s)',client.id);
    //TODO: check if is object
    switch (data.cmd) {
      /**
       * list file result
       * dataformat: {cmd:'ls',clientId:'',masterId:'',data:[{name:'',path:'',type:'',size:'',mtime:''}]}
       */
      case 'ls':
        console.log(data);
        break;
    }
  }

  /**
   * 处理master发过来的msg
   */
  var masterHandler = function(client,data){

  }

  var listFile = function(masterId,clientId,path){
    var client = slaveList[clientId];
    var obj = {cmd:'ls',path:path,masterId:masterId};
    if(client){
      client.emit('message',obj,function(ok){
        //console.log('client got:',ok)
      });
    }else{
      console.log('no such client:',clientId);
    }
  }
};